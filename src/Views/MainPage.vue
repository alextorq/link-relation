<template>
  <div class="hello">
    <form action="/" style="display: flex; align-items: center; justify-content: center;" @submit.prevent="getContents">
      <Select :value="searchQuery"
              @input="getSearchTitle" :options="searchSuggest"></Select>
      <Select :value="search2Query" @input="getSearchTitle2" :options="searchSuggest2"></Select>
        <button :disabled="!isShowSubmit">Submit</button>
    </form>

    <bruch v-if="isShowBrunch" :brunch="brunch"/>

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
import {computed, defineComponent, onMounted, ref} from 'vue';
import {getContent, getSearch} from '@/API';
import {DTO} from '../../server/TREE';
import graf from '../components/Graf.vue';
import pagination from '../components/Pagination.vue';
import apiID from '@/API/apiID';
import {Commands} from '../../server/API/index';
const ws = new WebSocket(`ws://localhost:3001?id=${apiID.id}`);
import bruch from '@/components/bruch.vue';
import Select from '@/components/Select.vue';

let timerID: any = null;

export default defineComponent({
  setup() {
    const searchQuery = ref('Прометей');
    const search2Query = ref('Идалион');

    const initialDTO: DTO = {
      id: '',
      name: '',
      parent: null,
      child: [],
    };

    const initialBrunch: DTO[] = [];
    const brunch = ref(initialBrunch);

    const isShowBrunch = computed(() => !!brunch.value.length);

    const treeDTO = ref(initialDTO);

    ws.addEventListener('message', (e) => {
      const payload = JSON.parse(e.data);
      const command = payload.command;
      const data = payload.data;
      if (command === Commands.S_SEND_TREE) {
        updateTree(data);
      }
      if (command === Commands.S_FINISH) {
        updateBrunch(data);
      }
    });

    const isShowSubmit = computed(() => !!search2Query.value && !!searchQuery.value);

    const key = ref(1);

    const searchSuggest = ref<object[]>([]);
    const searchSuggest2 = ref<object[]>([]);

    const page = ref(1);
    const itemPerPage = ref(6);

    const changeNode = (id: string) => {
      if (!id) return;
      changePage(1);
      requestTree(id, id);
    };

    const updateTree = (data: DTO) => {
      clearTimeout(timerID);
      timerID = setTimeout(() => {
        treeDTO.value = data;
        key.value++;
      }, 1000);
    };

    const updateBrunch = (data: DTO[]) => {
      brunch.value = data;
      key.value++;
    };

    const requestTree = (title: string, id?: string) => {
      const command = {
        command: Commands.C_CHANGE_NODE,
        payload: {
          title,
          id,
          childLevel: 2,
        },
      };
      ws.send(JSON.stringify(command));
    };

    const changePage = (p: number) => {
      page.value = p;
      key.value++;
    };

    const getSearchTitle = async (title: string) => {
      searchQuery.value = title;
      const {data} = await getSearch(title);
      searchSuggest.value = data as Array<object>;
    };

    const getSearchTitle2 = async (title: string) => {
      search2Query.value = title;
      const {data} = await getSearch(title);
      searchSuggest2.value = data as Array<object>;
    };

    const getContents = async () => {
      const {data} = await getContent(searchQuery.value, search2Query.value);
      updateTree(data);
    };

    onMounted(() => {
      getSearchTitle(searchQuery.value);
      getSearchTitle2(search2Query.value);
    });

    return {
      searchQuery,
      search2Query,
      searchSuggest,
      searchSuggest2,
      getSearchTitle,
      getContents,
      treeDTO,
      key,
      page,
      itemPerPage,
      changeNode,
      changePage,
      brunch,
      isShowBrunch,
      getSearchTitle2,
      isShowSubmit,
    };
  },

  components: {
    graf,
    pagination,
    bruch,
    Select,
  },
});

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
