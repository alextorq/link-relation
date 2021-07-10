<template>
  <div
      @focus="handleFocus"
      @focusout="handleFocusOut"
      tabindex="0"
      class="select" :class="classWrapper">
      <input type="text"
             ref="input"
             v-model="val"
             @keyup.esc="handleFocusOut"
             @focus="handleFocus">
    <ul>
      <li v-for="item of options" @click="() => selectItem(item)" :key="item">
        {{item.title}}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';

export default defineComponent({
  name: 'Select',
  data() {
    return {
      open: false,
    };
  },
  computed: {
    val: {
      get(): string|undefined {
        return this.value;
      },
      set(newVal: string) {
        this.$emit('input', newVal);
      },
    },
    classWrapper(): {open: boolean} {
      return {
        open: this.open,
      };
    },
  },
  methods: {
    handleFocus() {
      this.open = true;
    },
    handleFocusOut() {
      this.open = false;
      (this.$refs.input as HTMLInputElement).blur();
    },
    selectItem(item: { title: string }) {
      this.$emit('select', item);
      this.$emit('input', item.title);
      this.handleFocusOut();
    },
  },
  emits: {
    input(payload: string) {
      return !!payload;
    },
    select(item: object) {
      return typeof item === 'object';
    },
  },
  props: {
    value: {
      type: String as PropType<string>,
      require: true,
    },
    options: {
      type: Array,
      require: true,
    },
  },
});
</script>

<style scoped>
    .select {
      position: relative;
      width: 300px;
    }
    .select.open ul{
      display: block;
    }
    ul {
      position: absolute;
      left: 0;
      right: 0;
      top: 100%;
      background: white;
      display: none;
      padding: 0;
      margin: 0;
      border: 1px solid grey;
    }
    input {
      width: 100%;
    }
    li {
      display: block;
      text-align: left;
      padding: 5px;
      margin: 0;
      cursor: pointer;
    }
    li:hover {
      background-color: aquamarine;
    }
    li:last-child {
      margin-bottom: 0;
    }
</style>
