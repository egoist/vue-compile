<script lang="ts">
export const foo = 'foo'
</script>

<script lang="ts" setup>
import { defineProps } from 'vue'

const props = defineProps({
  foo: Number,
})
</script>

<template>
  <div>{{ props.foo }}</div>
</template>
