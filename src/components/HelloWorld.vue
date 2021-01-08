<template>
  <div class="hello">
    <form action="" @submit.prevent="getSearchTitles">
      <input type="text" v-model="searchQuery">
      <input type="text" v-model="search2Query">
        <button>Submit</button>
    </form>
    <form>
      <select>
        <option :value="item.title"
                :key="item.title"
                v-for="item of searchSuggest">
          {{item.title}}
        </option>
      </select>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import {getSearch} from "@/API";
// import {Tree} from "../../server/TREE";

const Component = defineComponent({
  setup() {
      const searchQuery = ref('');
      const search2Query = ref('');

      let searchSuggest: Array<any> = [];
      let searchSuggest2: Array<any> = [];

      const getSearchTitles = async () => {
        const {data} = await getSearch(searchQuery.value, search2Query.value);
        searchSuggest = data[0];
        searchSuggest2 = data[1];
      }

      return {
        searchQuery,
        search2Query,
        searchSuggest,
        searchSuggest2,
        getSearchTitles
      }
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
