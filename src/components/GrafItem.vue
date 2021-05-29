<template>
  <path
      :d="item.path"></path>
  <g>
    <circle
        @click="handle(item)"
        :r="40"
        :cx="item.lastX"
        :class="classes"
        :cy="item.lastY - 40"/>
    <text
        @click="handle(item)"
        :x="item.lastX"
        :y="item.lastY - 40"
        text-anchor="middle"
        stroke="#000"
        font-size="18"
        letter-spacing="1px"
        stroke-width="1px"
        dy=".3em">
      {{item.name}}
    </text>
  </g>
</template>

<script >
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: "GrafItem",
  setup(props, {emit}) {

    const handle = (item) => {
      emit('click', item)
    }


    const classes = computed(() => {
        return {
          list: !!props.item.amountChildren
        }
    })

    return {
      handle,
      classes,
      item: props.item
    }

  },
  emits: {
    click(payload) {
      return !!payload
    }
  },
  props:  {
    item: Object,
  }
})
</script>

<style scoped>
  path {
    fill: none;
    stroke: #000;
    stroke-width: 1.5px;
  }
  circle {
    fill: #dbdce0;
    transform-origin: center center;
    transition: all 0.4s;
  }
  .list {
    fill: #c6ecc7;
    stroke-width: 10px;
    cursor: pointer;
  }

  .list:hover {
    r: 35;
  }

</style>
