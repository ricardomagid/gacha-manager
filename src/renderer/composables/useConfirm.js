import { ref } from 'vue'

const confirmState = ref(null)

export function useConfirm() {
    const confirm = (message) => {
        return new Promise((resolve) => {
            confirmState.value = {
                message,
                onConfirm: () => { confirmState.value = null; resolve(true) },
                onCancel: () => { confirmState.value = null; resolve(false) }
            }
        })
    }

    return { confirmState, confirm }
}