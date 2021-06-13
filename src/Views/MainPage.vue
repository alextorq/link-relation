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
import longSleepWorker from '@/Worker'
import {clientCommand, ClientCommands, webSocketCommands, CommandsTypes } from '@/Worker/Commands'
const ws = new WebSocket(`ws://localhost:3001?id=${apiID.id}`);

let timerID: any = null

export default defineComponent({
  setup() {
      const searchQuery = ref('Прометей');
      const search2Query = ref('Атлант');

      const initialDTO: DTO = {
        id: '',
        name: '',
        parent: null,
        child: []
      }

      const treeDTO = ref(initialDTO)

      longSleepWorker.worker.onmessage = (event: any) => {
        updateTree(event.data.data)
      }

      ws.addEventListener('message', (e) => {
        const payload: webSocketCommands = {
          commandTypes: CommandsTypes.WEBSOCKET,
          data: JSON.parse(e.data)
        }
        longSleepWorker.send(payload)
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


    const requestTree = (title: string, id?: string) => {
      const commands = [{
        command: ClientCommands.requestTree,
        payload: {
          title,
          id,
          childLevel: 2
        }
      }]
      longSleepWorker.send({ commandTypes: CommandsTypes.CLIENT, commands})
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
        const {data} = await getContent(pageTitle.value);
        const createTree: clientCommand = {
          command: ClientCommands.ChangeRoot,
          payload: {
            title: pageTitle.value
          }
        }
        const titles = data.child.map(item => item.name);
        const addChild: clientCommand = {
          command: ClientCommands.AddChild,
          payload: {
            title: pageTitle.value,
            child: titles
          }
        }
        const commands = [createTree, addChild]
        longSleepWorker.send({ commandTypes: CommandsTypes.CLIENT, commands})

        requestTree(pageTitle.value)
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
