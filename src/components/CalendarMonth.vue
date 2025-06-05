<template>
    <div class="calendar_wrap">
        <div class="pf_calendar">
            <div class="cal_set">
                <h3 class="title">Calendar</h3>
                <div class="cal_inner">
                    <!-- 화살표로 월을 넘기기 -->
                    <button @click="changeMonth(-1)" class="nav-btn">⮜</button>
                    <span class="month-year">{{ currentMonthYear }}</span>
                    <button @click="changeMonth(1)" class="nav-btn">⮞</button>
                </div>
            </div>
            <table class="pf_calendar_table">
                <thead>
                    <tr>
                        <th>SUN</th>
                        <th>MON</th>
                        <th>TUE</th>
                        <th>WED</th>
                        <th>THU</th>
                        <th>FRI</th>
                        <th>SAT</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(week, index) in calendarWeeks" :key="index">
                        <td v-for="(day, dayIndex) in week" :key="dayIndex" :class="{
                            'inactive-day': day.isInactive,
                            'selected': day.isSelected,
                            'today': day.isToday,
                            'sunday': day.dayOfWeek === 0,  // 일요일 빨간색
                            'saturday': day.dayOfWeek === 6  // 토요일 파란색
                        }" @click="selectDay(day)">
                            <em>{{ day.date }}</em>
                            <ul class="schedule-preview" v-if="day.schedules?.length">
                                <li v-for="(item, i) in day.schedules.slice(0, 3)" :key="i">
                                    {{ item.length > 10 ? item.slice(0, 10) + '...' : item }}
                                </li>
                                <li v-if="day.schedules.length > 3">...</li>
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
// import { autoLeftPad } from "@/utils/utils";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

// 현재 날짜와 선택된 날짜, 요일 배열 설정
const store = useStore();
const router = useRouter();
const nowDate = new Date();
let select = ref({
    year: nowDate.getFullYear(),
    month: nowDate.getMonth() + 1,
});
const STORAGE_KEY = 'schedule-data';
const fullData = ref({})  //
// 현재 월과 연도 표시
const currentMonthYear = computed(() => {
    return `${select.value.year}년 ${select.value.month}월`;
});

// 달력 주를 계산하는 함수
const calendarWeeks = computed(() => {
    const firstDayOfMonth = new Date(select.value.year, select.value.month - 1, 1);
    const lastDayOfMonth = new Date(select.value.year, select.value.month, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const lastDayOfMonthDate = lastDayOfMonth.getDate();

    const weeks = [];
    let week = [];
    let prevMonthDays = new Date(select.value.year, select.value.month - 1, 0).getDate();

    // 앞 부분 이전 달 날짜 추가 (연한 회색으로 표시)
    for (let i = 1 - firstDayOfWeek; i < 1; i++) {
        week.push({
            date: prevMonthDays + i,
            isInactive: true,  // 이전 달 날짜로 회색 처리
            isSelected: false,
            isToday: false,
            dayOfWeek: (firstDayOfWeek + i - 1) % 7, // 요일 계산
        });
    }

    // 이번 달 날짜 추가
    for (let i = 1; i <= lastDayOfMonthDate; i++) {
        const date = new Date(select.value.year, select.value.month - 1, i);
        const y = select.value.year;
        const m = select.value.month;
        const d = i;

        const schedules = fullData.value?.[y]?.[m]?.[d] || [];
        week.push({
            date: i,
            isInactive: false,
            isSelected: false,
            isToday: date.toDateString() === new Date().toDateString(),
            dayOfWeek: (firstDayOfWeek + i - 1) % 7, // 요일 계산
            schedules,
        });

        // 한 주가 끝날 때마다 새로운 행을 추가
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    }

    // 다음 달 날짜 추가 (연한 회색으로 표시)
    let nextMonthDays = 1;
    for (let i = week.length; i < 7; i++) {
        week.push({
            date: nextMonthDays,
            isInactive: true,  // 다음 달 날짜로 회색 처리
            isSelected: false,
            isToday: false,
            dayOfWeek: (firstDayOfWeek + nextMonthDays - 1) % 7, // 요일 계산
        });
        nextMonthDays++;
    }
    weeks.push(week); // 마지막 주 추가

    return weeks;
});

// 월을 변경하는 함수 (화살표 클릭)
const changeMonth = (direction) => {
    if (select.value.month === 1 && direction === -1) {
        select.value.year--;
        select.value.month = 12;
    } else if (select.value.month === 12 && direction === 1) {
        select.value.year++;
        select.value.month = 1;
    } else {
        select.value.month += direction;
    }
};

// 날짜 선택 처리
const selectDay = (day) => {
    if (!day.isInactive) {
        // 선택된 날짜 강조
        day.isSelected = !day.isSelected;
    }
    const selected = {
        year: select.value.year,
        month: select.value.month,
        date: day.date
    }
    store.commit("calendar/setSelectDate", selected);
    router.push("/daily");
};
onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
        fullData.value = JSON.parse(stored)
    }
})
</script>

<style lang="scss" scoped>
.calendar_wrap {
    display: flex;
    justify-content: center;
    margin-top: 80px;
}

.pf_calendar {
    width: 80%;
    height: 100%;
    padding: 30px 20px 20px 20px;
    border-radius: 10px;
    background: #f5f7fb;
    border: 1px solid #e0e8f1;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
}

.cal_set {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.cal_set .title {
    color: #034380;
    font-family: 'Montserrat', sans-serif;
    font-size: 24px;
    font-weight: 700;
    margin: 0;
}

.cal_inner {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 20px;
}

.nav-btn {
    font-size: 20px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    border: 1px solid #e0e8f1;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.3s ease;
}

.nav-btn:hover {
    background: #f1f5f9;
}

.month-year {
    font-size: 20px;
    font-weight: bold;
    color: #333;
}

.pf_calendar_table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

.pf_calendar_table tr>th {
    width: 14.2857%; 
    padding: 15px;
    text-align: center;
    border: solid 1px #e0e8f1;
    color: #7a7a7a;
    background: #f1f5f9;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
}

.pf_calendar_table tr>td {
    width: 14.2857%; 
    padding: 15px 12px;
    text-align: center;
    font-weight: 500;
    font-size: 16px;
    background: #ffffff;
    border: solid 1px #e0e8f1;
    cursor: pointer;
    transition: all 0.3s ease;
}

.pf_calendar_table tr>td:hover {
    background-color: #f1f5f9;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.pf_calendar_table tr>td.cover {
    opacity: 0.4;
    cursor: not-allowed;
}

.pf_calendar_table tr>td.inactive-day {
    color: #b0b0b0;
    /* 회색으로 표시 */
}

.pf_calendar_table tr>td.sunday {
    color: #FF4D4D;
    /* 일요일 빨간색 */
}

.pf_calendar_table tr>td.saturday {
    color: #4D4DFF;
    /* 토요일 파란색 */
}

.pf_calendar_table tr>td.selected {
    background-color: #4e7f9e;
    color: white;
    font-weight: bold;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
}

.pf_calendar_table tr>td {
    position: relative;
    padding: 20px 5px;
    height: 70px;
}

.pf_calendar_table tr>td em {
    position: absolute;
    top: 5px;
    right: 5px;
    font-style: normal;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.pf_calendar_table tr>td.today em {
    background-color: #16ff29;
    border-radius: 50%;
}
.schedule-preview li{
    text-align: left;
    padding: 5px 0;
}
/* .schedule-preview{
    overflow: hidden;
}
.schedule-preview li{
    text-align: left;
    padding: 5px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
} */
</style>