<template>
    <ul class="container mx-auto">
      <li @click="handle(item)"
          :class="{
              active: item === page
          }"
          v-for="item of pagesItems">
          {{item}}
      </li>
      <li v-show="isShowLastPage">
        ...
      </li>
      <li v-show="isShowLastPage">
        {{countOfPage}}
      </li>
    </ul>
</template>

<script >
import {defineComponent, ref, computed} from 'vue'
export default defineComponent({
  name: "Pagination",
  setup(props, {emit}) {
    const currentPage = ref(1)
    const countOfPage = computed(() => props.pages.length / props.itemPerPage)
    const pagesItems = computed(() => Math.min(currentPage.value + 6, countOfPage.value))

    const isShowLastPage = computed(() => countOfPage > pagesItems)

    const handle = (page) => {
      emit('changePage', page)
    }

    return {
      countOfPage,
      pagesItems,
      handle,
      isShowLastPage
    }
  },
  props: {
    pages: Array,
    itemPerPage: Number,
    page: Number,
  }
})
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
