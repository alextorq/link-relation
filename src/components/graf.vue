<template>
  <svg :viewBox="viewBox">
    <circle :r="radius"
            :cx="halfSize"
            :cy="topHeight"
            fill="green"/>
    <path
        v-for="item of coordinats"
        :d="item"></path>
  </svg>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';

const Component = defineComponent({
  setup(props) {
    const items  = ['122', 'asd', 'asd', 'asd', 'asd'];
    const arrayLength = items.length;

    const radius = ref(40);
    const size = ref(1000);
    const topHeight = ref((size.value/ 100) * 20);
    const halfSize = computed(() => size.value / 2);
    const viewBox = computed(() => `0 0 ${size.value} ${size.value}`);
    const startPoint = computed(() => `${halfSize.value},${topHeight.value + radius.value}`);
    const startPointControl = computed(() => `${halfSize.value},${topHeight.value + radius.value + 200}`);
    const distance = computed(() => size.value/arrayLength)

    const coordinats = computed(() => {
      return items.map((item , index) => {
        const x = index * distance.value + (distance.value * 0.5)

        const path = () => `M ${startPoint.value} C ${startPointControl.value} ${x},${halfSize.value} ${x},${size.value}`;
        return path();
      });
    });

    return {
      radius,
      halfSize,
      topHeight,
      viewBox,
      startPoint,
      coordinats
    }
  }
});

export default Component;
</script>

<style scoped>
  svg {
    width: 50vw;
    height: 50vw;
  }
  path {
    fill: none;
    stroke: #000;
    stroke-width: 1.5px;
  }
</style>
