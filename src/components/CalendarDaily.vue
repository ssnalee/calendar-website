<template>
    <div class="day-view">
        <h3 class="day-title">{{ selectDate.year }}년 {{ selectDate.month }}월 {{ selectDate.date }}일</h3>
        <ul>
            <li v-for="(item, index) in scheduleList" :key="index">
                <p>{{ item }}</p>
                <button @click="deleteHandler(index)">삭제</button>
            </li>
        </ul>
        <div class="schedule-form">
            <input type="text" placeholder="일정을 입력하세요" v-model="inputText"  @keyup.enter="saveHandler" />
            <button @click="saveHandler">저장</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
// import { useRouter } from "vue-router";
import { useStore } from "vuex";
const store = useStore();
// const router = useRouter();
const STORAGE_KEY = 'schedule-data';
const inputText = ref('')
const fullData = ref({});
const selectDate = computed(() => store.state.calendar.selectDate);
const scheduleList = computed(() => {
    return (
        fullData.value?.[selectDate.value.year]?.[selectDate.value.month]?.[selectDate.value.date] || []
    )
})
const saveHandler = () => {
    const text = inputText.value.trim()
    if (!text) return

    const y = selectDate.value.year
    const m = selectDate.value.month
    const d = selectDate.value.date

    if (!fullData.value[y]) fullData.value[y] = {}
    if (!fullData.value[y][m]) fullData.value[y][m] = {}
    if (!fullData.value[y][m][d]) fullData.value[y][m][d] = []

    fullData.value[y][m][d].push(text)
    inputText.value = ''
    persist()
}

const deleteHandler = (index) => {
    const list = scheduleList.value
    if (list && list.length > index) {
        list.splice(index, 1)
        persist()
    }

}
const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullData.value))
}
onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
        fullData.value = JSON.parse(stored)
    }
})
</script>

<style style="scss" scoped>
.day-view {
    max-width: 500px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 50px;
    background: #fdfdfd;
    border: 1px solid #eee;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    font-family: 'Pretendard', sans-serif;

    ul {
        li {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 0;

            button {
                background-color: #ffc8c8;
                color: #ff0000;
                padding: 5px 10px;
                border-radius: 8px;
            }

        }
    }
}

.day-title {
    font-size: 1.4rem;
    text-align: center;
    color: #333;
    width: fit-content;
    margin: 0 auto 2rem;
    border-bottom: 4px double #ffee00;
}

.schedule-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1.5rem 0;
}

.schedule-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f9f9f9;
    padding: 0.6rem 1rem;
    margin-bottom: 0.5rem;
    border-radius: 8px;
    transition: background 0.2s;
}

.schedule-item:hover {
    background: #f0f0f0;
}

.schedule-text {
    margin: 0;
    color: #444;
    font-size: 0.95rem;
}


.schedule-form {
    display: flex;
    gap: 0.5rem;
    input{
        padding: 5px;
        outline: none;
        border: 1px solid #ccc;
        border-radius: 8px;
    }
    button {
        background-color: #deffc8;
        color: #4ec200;
        border: 1px solid #4ec200;
        padding: 5px 10px;
        border-radius: 8px;
    }
}
</style>