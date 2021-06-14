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

    <bruch :key="key" :brunch="brunch"></bruch>

    <graf
        :key="key"
        :offset="page"
        :itemPerPage="itemPerPage"
        @changeNode="changeNode"
        :tree="treeDTO"/>

    <pagination :pages="treeDTO.child"
                :page="page"
                @changePage="changePage"
                :itemPerPage="itemPerPage"
                :key="key"/>

  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, ref} from 'vue'
import {getContent, getSearch} from "@/API";
import {DTO} from "../../server/TREE";
import graf from '../components/Graf.vue'
import pagination from '../components/Pagination.vue'
import apiID from "@/API/apiID";
import {Commands} from "../../server/API/index";
const ws = new WebSocket(`ws://localhost:3001?id=${apiID.id}`);
import bruch from "@/components/bruch.vue";

let timerID: any = null

export default defineComponent({
  setup() {
      const searchQuery = ref('Прометей');
      const search2Query = ref('Идалион');

      const initialDTO: DTO = {
        id: '',
        name: '',
        parent: null,
        child: []
      }

      const initialBrunch: DTO[] = []
      const brunch = ref(initialBrunch)

      const treeDTO = ref(initialDTO)

      ws.addEventListener('message', (e) => {
        const payload = JSON.parse(e.data)
        const command = payload.command
        const data = payload.data
        if (command === Commands.S_SEND_TREE) {
          updateTree(data)
        }
        if (command === Commands.S_FINISH) {
          updateBrunch(data)
        }
      });

      let key = ref(1);

      const searchSuggest = ref([]);
      const searchSuggest2 = ref([]);

      const pageTitle = ref('')
      const pageTitle2 = ref('')

      let page = ref(1);
      let itemPerPage = ref(6);


     const changeNode = (id: string) => {
       if (!id) return
       changePage(1)
       requestTree(id, id)
     }

    const updateTree = (data: DTO) => {
      clearTimeout(timerID)
      timerID = setTimeout(() => {
        treeDTO.value = data
        key.value++
      }, 1000)
    }

    const updateBrunch = (data: DTO[]) => {
      brunch.value = data
      key.value++
    }

    const requestTree = (title: string, id?: string) => {
      const command = {
        command: Commands.C_CHANGE_NODE,
        payload: {
          title,
          id,
          childLevel: 2
        }
      }
      ws.send(JSON.stringify(command))
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

      const getContents = async () => {
        const {data} = await getContent(pageTitle.value, pageTitle2.value);
        updateTree(data)
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
        changePage,
        brunch
      }
  },

  components: {
    graf,
    pagination,
    bruch
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
