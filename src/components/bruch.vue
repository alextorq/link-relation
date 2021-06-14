<template>
  <ul class="container mx-auto">
    <li @click="handle(item)"
        v-for="item of reverse">
      {{item.name}}
    </li>
  </ul>
</template>

<script lang="ts">
import {defineComponent, ref, computed, PropType} from 'vue'
import {DTO} from "../../server/TREE";

export default defineComponent({
  name: "bruch",
  setup(props, {emit}) {
    const handle = (page: any) => {
      // emit('changePage', page)
    }
    const reverse = computed(() => props.brunch.reverse())
    return {
      handle,
      reverse
    }
  },
  props: {
    brunch: {
      type: Array as PropType<DTO[]>,
      required: true
    },
  }
})
</script>

<style scoped>
  li:after {
      content: '->';
      display: inline-block;
      position: absolute;
      bottom: 5px;
      left: 50%;
      transform: translateX(-50%) rotate(90deg) ;
  }
  li:last-child:after{
      display: none;
  }
  li {
    position: relative;
    padding-bottom: 40px;
    display: block;
  }
  ul {
    position: fixed;
    left: 10%;
    top: 10%;
    display: block;
    padding: 20px;
    border: 1px solid green;
  }
</style>
