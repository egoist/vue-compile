<script lang="ts">
export const foo = 'foo'
</script>

<script lang="ts" setup>
import { defineProps, PropType } from 'vue'

const props = defineProps({
  foo: Number as PropType<number>,
})
</script>

<template>
  <div>{{ props.foo }}</div>
</template>
