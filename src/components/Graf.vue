<template>
  <svg :viewBox="viewBox">
    <circle :r="radius"
            :cx="halfSize"
            :cy="topHeight"
            fill="green"/>
      <text
          :x="halfSize"
          :y="topHeight"
          text-anchor="middle"
          stroke="#000"
          font-size="18"
          stroke-width="2px"
          dy=".3em">
         {{title}}
      </text>


    <GrafItem
        @click="handleClick"
        v-for="item of coordinats" :item="item"></GrafItem>

  </svg>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import {Tree, NodeTree} from "../../server/TREE";
import GrafItem from "@/components/GrafItem.vue";

const Component = defineComponent({
  setup({tree}, context) {
    const emit = context.emit;
    type nodes = Array<NodeTree>;
    const items = ref<nodes>(tree?.getRoot()?.getChild().slice(0, 4) ?? []);
    const arrayLength = items.value.length;
    const title = ref(tree?.getRoot()?.getTitle() ?? '')

    const radius = ref(40);
    const size = ref(1000);
    const topHeight = ref((size.value/ 100) * 20);
    const halfSize = computed(() => size.value / 2);
    const viewBox = computed(() => `0 0 ${size.value} ${size.value}`);
    const startPoint = computed(() => `${halfSize.value},${topHeight.value + radius.value}`);
    const startPointControl = computed(() => `${halfSize.value},${topHeight.value + radius.value + 200}`);
    const distance = computed(() => size.value/arrayLength);


    const handleClick = (item: any) => {
      title.value = item.name;
    }


    const handle = (item: any) => {
      emit('click', item)
    }

    const coordinats = computed(() => {
      return items.value.map((item , index) => {
        const x = index * distance.value + (distance.value * 0.5)

        const path = () => `M ${startPoint.value} C ${startPointControl.value} ${x},${halfSize.value} ${x},${size.value}`;


        return  {
          path: path(),
          lastX: x,
          lastY: size.value,
          name: item.getTitle(),
          id: item.getID()
        }
      });
    });

    return {
      radius,
      halfSize,
      topHeight,
      viewBox,
      startPoint,
      coordinats,
      handle,
      handleClick,
      title
    }
  },
  props: {
    tree: Tree
  },
  components: {
    GrafItem
  }
});

export default Component;
</script>

<style scoped>
  svg {
    width: 100vw;
    height: 50vw;
  }

</style>
