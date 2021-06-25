<template>
    <ul class="container mx-auto">
      <li @click="handle(1)" v-show="isShowFirstPage">
        1
      </li>
      <li v-show="isShowFirstPage">
        ...
      </li>
      <li @click="handle(item)"
          :class="{
              active: item === page
          }"
          v-for="item of pageItems">
          {{item}}
      </li>
      <li v-show="isShowLastPage">
        ...
      </li>
      <li v-show="isShowLastPage" @click="handle(countOfPage)">
        {{countOfPage}}
      </li>
    </ul>
</template>

<script lang="ts">
import {defineComponent, computed, PropType} from 'vue';
const createRange = (start: number, end: number) => {
  const range = [];
  for (let startI = start; startI <= end; startI++) {
    range.push(startI);
  }
  return range;
};

export default defineComponent({
  name: 'Pagination',
  setup(props, {emit}) {
    const countOfPage = computed(() => Math.ceil(props.pages.length / props.itemPerPage));

    const startPage = computed(() => Math.max(1, props.page - 4));
    const endPage = computed(() => Math.min(props.page + 4, countOfPage.value));
    const pageItems = computed(() => createRange(startPage.value, endPage.value));

    const isShowLastPage = computed(() => countOfPage.value > endPage.value);
    const isShowFirstPage = computed(() => startPage.value > 1);

    const handle = (page: number) => {
      emit('changePage', page);
    };

    return {
      countOfPage,
      pageItems,
      handle,
      isShowLastPage,
      isShowFirstPage,
    };
  },
  emits: {
    changePage(payload: number) {
      return !!payload;
    },
  },
  props: {
    pages: {
      type: Array as PropType<Array<any>>,
      required: true,
    },
    itemPerPage: {
      type: Number as PropType<number>,
      required: true,
    },
    page: {
      type: Number as PropType<number>,
      required: true,
    },
  },
});
</script>

<style scoped>
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 60px;
  }
  li {
    margin-right: 10px;
    cursor: pointer;
    font-weight: 600;
  }
  li:last-child {
    margin-right: 0;
  }
  li:hover {
    color: #4fca76;
  }
  .active {
    color: #4fca76;
  }
</style>
