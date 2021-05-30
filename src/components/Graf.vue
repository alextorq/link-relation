<template>
  <svg :viewBox="viewBox">
    <circle :r="radius"
            :cx="halfSize"
            :cy="topHeight"
            @click="() => handleClick({id: parent})"
            fill="#c6ecc7"/>
      <text
          :x="halfSize"
          :y="topHeight"
          text-anchor="middle"
          stroke="#000"
          font-size="18"
          letter-spacing="1px"
          stroke-width="1px"
          dy=".3em">
         {{title}}
      </text>


    <GrafItem
        @click="handleClick"
        v-for="item of coordinats" :item="item"></GrafItem>

  </svg>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';
import {DTO} from "../../server/TREE";
import GrafItem from "@/components/GrafItem.vue";

export default  defineComponent({
  setup(props, context) {
    const emit = context.emit;

    const startIndex = computed(() =>(props.offset * props.itemPerPage) - props.itemPerPage);
    const endIndex = computed(() => startIndex.value + props.itemPerPage)

    const items = computed(() => props.tree.child.slice(startIndex.value, endIndex.value) || [])
    const arrayLength = computed(() => items.value.length);

    const title = computed(() => props.tree.name)
    const parent = computed(() => props.tree.parent)
    const level = ref(0)


    const radius = ref(40);
    const size = ref(1000);
    const topHeight = computed(() => (size.value/ 100) * 10);
    const halfSize = computed(() => size.value / 2);
    const viewBox = computed(() => `0 0 ${size.value} ${size.value}`);

    const startPoint = computed(() => `${halfSize.value},${topHeight.value + radius.value}`);
    const startPointControl = computed(() => `${halfSize.value},${topHeight.value + radius.value + 200}`);
    const distance = computed(() => size.value/arrayLength.value);

    const coordinats = computed(() => {
      return items.value.map((item: { child: string | any[]; name: any; id: any; }, index) => {
        const x = index * distance.value + (distance.value * 0.5)

        const path = () => `M ${startPoint.value} C ${startPointControl.value} ${x},${halfSize.value} ${x},${size.value - 50}`;
        const amountChildren = item.child.length;

        return  {
          path: path(),
          lastX: x,
          lastY: size.value,
          name: item.name,
          id: item.id,
          amountChildren: amountChildren
        }
      });
    });


    const handleClick = (item: any) => {
      emit('changeNode', item.id)
    }

    return {
      radius,
      halfSize,
      topHeight,
      viewBox,
      startPoint,
      coordinats,
      handleClick,
      title,
      level,
      parent
    }
  },
  emits: {
    changeNode(payload: string) {
      return !!payload
    }
  },
  props: {
    tree: {
      type: Object as PropType<DTO>,
      required: true
    },
    itemPerPage: {
      type: Number as PropType<number>,
      default: 5,
    },
    offset: {
      type: Number as PropType<number>,
      default: 1,
    }
  },
  components: {
    GrafItem
  }
});

</script>

<style scoped>
  svg {
    width: 100vw;
    height: 60vw;
  }
</style>
