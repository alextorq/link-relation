<template>
  <div v-show="level">
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 490 490" style="enable-background:new 0 0 490 490;" xml:space="preserve">
        <path d="M245,258.23l153.302,155.246L490,324.619L245,76.524L0,324.619l91.697,88.857L245,258.23z M43.502,324.14L245,120.101  l201.498,204.04l-47.717,46.252L245,214.653L91.219,370.393L43.502,324.14z"/>
    </svg>
  </div>
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
import { defineComponent, ref, computed, PropType } from 'vue';
import {DTO} from "../../server/TREE";
import GrafItem from "@/components/GrafItem.vue";

export default  defineComponent({
  setup(props, context) {
    const emit = context.emit;
    const root = ref(props.tree)
    const items = computed(() => root?.value?.child.slice(props.offset * props.itemPerPage, props.itemPerPage) ?? []);
    const title = computed(() => root?.value?.name)
    const level = ref(0)

    const arrayLength = computed(() => items.value.length);
    const radius = ref(40);
    const size = ref(1000);
    const topHeight = computed(() => (size.value/ 100) * 20);
    const halfSize = computed(() => size.value / 2);
    const viewBox = computed(() => `0 0 ${size.value} ${size.value}`);
    const startPoint = computed(() => `${halfSize.value},${topHeight.value + radius.value}`);
    const startPointControl = computed(() => `${halfSize.value},${topHeight.value + radius.value + 200}`);
    const distance = computed(() => size.value/arrayLength.value);


    const handleClick = (item: any) => {
      emit('changeNode', item.id)
    }

    const coordinats = computed(() => {
      return items.value.map((item: { child: string | any[]; name: any; id: any; }, index: number) => {
        const x = index * distance.value + (distance.value * 0.5)

        const path = () => `M ${startPoint.value} C ${startPointControl.value} ${x},${halfSize.value} ${x},${size.value}`;
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

    return {
      radius,
      halfSize,
      topHeight,
      viewBox,
      startPoint,
      coordinats,
      handleClick,
      title,
      level
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
    height: 50vw;
  }
</style>
