<template>
  <div class="hello">
    <form action="" @submit.prevent="getSearchTitles">
      <input type="text" v-model="searchQuery">
      <input type="text" v-model="search2Query">
        <button>Submit</button>
    </form>
    <form @submit.prevent="getContents">
      <select v-model="pageTitle">
        <option :value="item.title"
                :key="item.title"
                v-for="item of searchSuggest">
                {{item.title}}
        </option>
      </select>
      <select v-model="pageTitle2">
        <option :value="item.title"
                :key="item.title"
                v-for="item of searchSuggest2">
                {{item.title}}
        </option>
      </select>
      <button>Submit</button>
    </form>

    <graf
        :key="key"
        :tree="tree"></graf>


    <div class="pagination">

    </div>

  </div>
</template>

<script lang="ts">
import {defineComponent, ref, onMounted} from 'vue'
import {getContent, getSearch} from "@/API";
import {Commands, webSocketCommand, wikiAnswerContent} from '../../server/API'
import {NodeTree, Tree} from "../../server/TREE";
import graf from '../components/Graf.vue'

const ws = new WebSocket('ws://localhost:3001');

export default defineComponent({
  setup() {
      const searchQuery = ref('Прометей');
      const search2Query = ref('Печень');

      let key = ref(1);

      const searchSuggest = ref([]);
      const searchSuggest2 = ref([]);


      const pageTitle = ref('')
      const pageTitle2 = ref('')
      const node = new NodeTree(pageTitle.value)
      const treeI = new Tree(node)
      let tree = ref(treeI);


    const getSearchTitles = async () => {
        const {data} = await getSearch(searchQuery.value, search2Query.value);
        searchSuggest.value = data[0];
        searchSuggest2.value = data[1]
      }

      let currentNode:  NodeTree|null = null;

      ws.addEventListener('message', function (event: {data: string}) {
        const res = JSON.parse(event.data) as webSocketCommand
        if (res.command === Commands.DATA) {
          const payload = res.payload as wikiAnswerContent;
          const node = tree.value.findBFS((item) => item.getTitle() === payload.parse.title);
          const titles = payload.parse.links.map(item => item.title);
          node?.addRowChild(...titles);
          key.value++;
        }
        if (res.command === Commands.FINISH) {
          const rootID = tree.value.getRoot().getID()

          key.value++;
          if (!currentNode) {
            currentNode = tree.value.findBFS(item => item.getChild().length > 0 && item.getID() !== rootID);
          }else {
            currentNode = tree.value.getNext(currentNode.getID());
          }

          if (currentNode) {
            getContentsRec(currentNode.getChild().map(item => item.getTitle()));
          }

        }
      });

      const getContents = async () => {
        const {data} =  await getContent(pageTitle.value);
        tree.value = new Tree(new NodeTree(pageTitle.value));
        const node = tree.value.findBFS((item) => item.getTitle() === pageTitle.value);
        const titles = data.parse.links.map(item => item.title);
        node?.addRowChild(...titles);
        const request: webSocketCommand = {
          command: Commands.REQUEST_DATA,
          payload: titles
        }
        ws.send(JSON.stringify(request))
      }

      const getContentsRec = async (titles: string[]) => {
        const request: webSocketCommand = {
          command: Commands.REQUEST_DATA,
          payload: titles
        }
        ws.send(JSON.stringify(request))
      }

      onMounted(getSearchTitles)

      return {
        searchQuery,
        search2Query,
        searchSuggest,
        searchSuggest2,
        pageTitle,
        pageTitle2,
        getSearchTitles,
        getContents,
        tree,
        key
      }
  },

  components: {
    graf
  }
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.hello {
  overflow: hidden;
}
</style>
