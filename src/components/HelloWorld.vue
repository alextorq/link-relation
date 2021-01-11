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

    <graf></graf>


  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import {getSearch, getContent} from "@/API";
import {NodeTree, Tree} from "../../server/TREE";
import {wikiAnswerContent} from "../../server/API";
import graf from './graf.vue'

const ws = new WebSocket('ws://localhost:3001');

const Component = defineComponent({
  setup() {
      const searchQuery = ref('');
      const search2Query = ref('');

      const searchSuggest = ref([]);
      const searchSuggest2 = ref([]);


      const pageTitle = ref('')
      const pageTitle2 = ref('')

      let tree: Tree;


    const getSearchTitles = async () => {
        const {data} = await getSearch(searchQuery.value, search2Query.value);
        searchSuggest.value = data[0];
        searchSuggest2.value = data[1]
      }

      ws.addEventListener('message', function (event: {data: string}) {
        const res = JSON.parse(event.data) as wikiAnswerContent
        const node = tree.findBFF((item) => item.getTitle() === res.parse.title);
        const titles = res.parse.links.map(item => item.title);
        node?.addRowChild(...titles);

        console.log(tree)
      });

      const getContents = async () => {
        const {data} =  await getContent(pageTitle.value);
        tree = new Tree(new NodeTree(pageTitle.value));
        const node = tree.findBFF((item) => item.getTitle() === pageTitle.value);
        const titles = data.parse.links.map(item => item.title);
        node?.addRowChild(...titles);
        ws.send(JSON.stringify(titles))
      }


      return {
        searchQuery,
        search2Query,
        searchSuggest,
        searchSuggest2,
        pageTitle,
        pageTitle2,
        getSearchTitles,
        getContents
      }
  },

  components: {
    graf
  }
})
export default Component
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
</style>
