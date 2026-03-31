<template>
    <v-dialog v-model="dialog" max-width="600px" persistent>

        <v-card>
            <v-card-title>
                <span class="text-h6">{{ isEditMode ? 'Update Exam' : 'New Exam' }}</span>
            </v-card-title>

            <v-form @submit.prevent="submitForm" ref="formRef" v-model="formValid">
                <v-card-text>
                    <v-text-field v-model="exam.title" label="Title" :rules="[rules.required]" required></v-text-field>
                    <v-text-field v-model="exam.accessKey" label="Access Key" :rules="[rules.required]"
                        required></v-text-field>
                    <v-date-picker v-model="exam.examDate" label="Exam Date" :rules="[rules.required]"
                        required></v-date-picker>
                    <v-select v-model="exam.timeZone" :items="timeZones" label="Time Zone" :rules="[rules.required]"
                        required></v-select>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey" text @click="dialog = false">Cancel</v-btn>
                    <v-btn color="primary" type="submit">{{ isEditMode ? 'Update' : 'Create' }}</v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    modelValue: Boolean,
    initialExam: Object,
    editMode: Boolean
})

const emit = defineEmits(['update:modelValue', 'submit'])

const dialog = ref(false)
const exam = ref({ title: '', accessKey: '', examDate: '', timeZone: 'Africa/Nairobi' })
const isEditMode = ref(props.editMode)
const formRef = ref(null)
const formValid = ref(false)

const timeZones = ['Africa/Nairobi', 'Africa/Lagos', 'Africa/Johannesburg']

const rules = {
    required: (value) => !!value || 'Required.'
}

watch(() => props.modelValue, (val) => {
    dialog.value = val
})

watch(dialog, (val) => {
    emit('update:modelValue', val)
})

const openDialog = () => {
    exam.value = props.initialExam ? { ...props.initialExam } : {
        title: '',
        accessKey: '',
        examDate: '',
        timeZone: 'Africa/Nairobi'
    }
    isEditMode.value = props.editMode
    dialog.value = true
}

const submitForm = () => {
    if (formRef.value?.validate()) {
        emit('submit', exam.value)
        dialog.value = false
    }
}
</script>
