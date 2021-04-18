<script lang="ts">
import { ref } from 'vue'
export default {
  setup() {
    const a = ref('a')
    return {
      a: a.value ?? 'a',
    }
  },
}
</script>
