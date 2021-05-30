<template>
  <div class="hello">
    <form action="/" @submit.prevent="getSearchTitles">
      <input type="text" v-model="searchQuery">
      <input type="text" v-model="search2Query">
        <button>Submit</button>
    </form>
    <form action="/" @submit.prevent="getContents">
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
        :offset="page"
        :itemPerPage="itemPerPage"
        @changeNode="changeNode"
        :tree="treeDTO"></graf>

    <pagination :pages="treeDTO.child"
                :page="page"
                @changePage="changePage"
                :itemPerPage="itemPerPage"
                :key="key"
    ></pagination>

  </div>
</template>

<script lang="ts">
import {defineComponent, ref, onMounted, computed, reactive} from 'vue'
import {getContent, getSearch} from "@/API";
import {Commands, webSocketCommand, wikiAnswerContent} from '../../server/API'
import {NodeTree, Tree} from "../../server/TREE";
import graf from '../components/Graf.vue'
import pagination from '../components/Pagination.vue'
import apiID from "@/API/apiID";

const ws = new WebSocket(`ws://localhost:3001?id=${apiID.id}`);

let timerID: any = null

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
      let tree = new Tree(node)
      let selectedNode = tree.getRoot()
      let treeDTO = ref(selectedNode.getDTO(1))

      let page = ref(1);
      let itemPerPage = ref(6);


     const changeNode = (id: string) => {
       if (!id) return
       const node = tree.findBFS(item => item.getID() === id)
       if(node) {
         selectedNode = node
         treeDTO.value = selectedNode.getDTO(1)
       }
       changePage(1)
     }

    const updateTree = () => {
      clearTimeout(timerID)
      timerID = setTimeout(() => {
        treeDTO.value = tree.getDTO()
        key.value++
      }, 1000)
    }

    const changePage = (p: number) => {
      page.value = p
      key.value++
    }

    const getSearchTitles = async () => {
        const {data} = await getSearch(searchQuery.value, search2Query.value);
        searchSuggest.value = data[0];
        searchSuggest2.value = data[1]
      }

      ws.addEventListener('message', function (event: {data: string}) {
        const res = JSON.parse(event.data) as webSocketCommand
        try {
          let title = res.payload.parse.title
        }catch (e) {
          return;
        }
        if (res.command === Commands.DATA) {
          const payload = res.payload as wikiAnswerContent;
          const node = tree.findBFS((item) => item.getTitle() === payload.parse.title);
          const titles = payload.parse.links.map(item => item.title);
          node?.addRowChild(...titles);
          updateTree();
        }
      });

      const getContents = async () => {
        const {data} =  await getContent(pageTitle.value);
        const root = new NodeTree(pageTitle.value)
        tree = new Tree(root);
        const titles = data.child.map(item => item.name);
        root?.addRowChild(...titles);
        updateTree()
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
        treeDTO,
        key,
        page,
        itemPerPage,
        changeNode,
        changePage
      }
  },

  components: {
    graf,
    pagination
  }
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
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
