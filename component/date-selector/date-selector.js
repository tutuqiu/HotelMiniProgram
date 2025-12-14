// component/date-selector/date-selector.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    defaultCheckInDate:{
      type:String
    },
    defaultCheckOutDate:{
      type:String
    },
    needPrice:{
      type:Boolean
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isReady:false,
    checkIn:'',
    checkOut:'',
    today:'',
    calendarList:[],
    needPrice:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initDateSelector(){
      this.generateCalendarList()
      this.setData({
        checkIn:this.properties.defaultCheckInDate,
        checkOut:this.properties.defaultCheckOutDate,
        isReady:true,
        needPrice:this.properties.needPrice
      })
    },
    generateCalendarList(){
      const now = new Date();

      // 1.生成今日日期
      const todayYear = now.getFullYear();
      const todayMonth = (now.getMonth() + 1).toString().padStart(2, '0'); // 补零
      const todayDay = now.getDate().toString().padStart(2, '0'); // 补零
      const today = `${todayYear}-${todayMonth}-${todayDay}`;

      // 2.生成包含本月的往后12个月列表
      const calendarList = []
      let currentYear = now.getFullYear();
      console.log('currentYear:',currentYear)
      let currentMonth = now.getMonth() + 1;

      for (let i = 0; i < 12; i++) {
        const monthStr = currentMonth.toString().padStart(2, '0')
        console.log(`${currentYear.toString()}-${monthStr}`)
        calendarList.push({
          year: currentYear.toString(),
          month: monthStr,
          id: i + 1 // 唯一ID（1-12）
        })
        
        //跨年处理
        currentMonth += 1
        if (currentMonth > 12) {
          currentMonth = 1;
          currentYear += 1;
        }
      }

      this.setData({
        today:today,
        calendarList:calendarList        
      })

      console.log('date-selector today:',this.data.today)
      console.log('date-selector calendarList:',this.data.calendarList)
    },

    confirmDate(e){
      const {checkInDate,checkOutDate}=e.detail
      console.log('date-calendar checkInDate:',checkInDate)
      console.log('date-calendar checkOutDate:',checkOutDate)
      
      if (!checkInDate || !checkOutDate) 
        return;

      this.triggerEvent('confirm',{
        checkInDate:checkInDate,
        checkOutDate:checkOutDate
      })
    },
    updateCalendar(e){
      const {checkInDate,checkOutDate}=e.detail
      for(let i=1;i<=12;i++){
        console.log(i)
        const key=`#calendar-${i}`
        const calendar=this.selectComponent(key)
        if(calendar)
          calendar.updateDate(checkInDate,checkOutDate)
      }
    },
    onHideModal(){
      this.triggerEvent('hide')
    },
    noop(){

    }
  },
  attached(){
    console.log('date-selector挂载,执行 init');
    this.initDateSelector()
  }
})