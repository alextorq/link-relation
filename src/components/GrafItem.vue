<template>
  <path
      :d="item.path"></path>
  <g>
    <circle
        @click="handle(item)"
        :r="40"
        :cx="item.lastX"
        :cy="item.lastY - 40"
        :fill="fillColor"/>
    <text
        @click="handle(item)"
        :x="item.lastX"
        :y="item.lastY - 40"
        text-anchor="middle"
        stroke="#000"
        font-size="18"
        stroke-width="2px"
        dy=".3em">
      {{item.name}}
    </text>
  </g>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: "GrafItem",
  setup({item}, {emit}) {

    const handle = (item) => {
      emit('click', item)
    }

    const fillColor = computed(() => {
      const color = !!item.amountChildren ? 'green' : 'gray'
      return color;
    })

    return {
      handle,
      fillColor
    }

  },
  props:  {
    item: Object,
    offset: Number,
    limit: Number,
  }
})
</script>

<style scoped>
  path {
    fill: none;
    stroke: #000;
    stroke-width: 1.5px;
  }
</style>
