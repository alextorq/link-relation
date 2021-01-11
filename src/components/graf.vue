<template>
  <svg :viewBox="viewBox">
    <circle :r="radius"
            :cx="halfSize"
            :cy="topHeight"
            fill="green"/>
    <path d="M "></path>
  </svg>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';

const Component = defineComponent({
  setup(props) {
    const radius = ref(40);
    const size = ref(1000);
    const topHeight = ref((size.value/ 100) * 20);
    const halfSize = computed(() => size.value / 2);
    const viewBox = computed(() => `0 0 ${size.value} ${size.value}`);
    const startPoint = computed(() => `${halfSize.value},${topHeight.value + radius.value}`);
    const startControlPoint = computed(() => `${halfSize.value},${halfSize.value}`);

    return {
      radius,
      halfSize,
      topHeight,
      viewBox,
      startPoint
    }
  }


});

export default Component;
</script>

<style scoped>

</style>
