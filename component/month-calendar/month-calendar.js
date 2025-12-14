// component/month-calendar/month-calendar.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    year:{
      type:String
    },
    month:{
      type:String
    },
    defaultCheckInDate:{
      type:String
    },
    defaultCheckOutDate:{
      type:String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    days:[],
    emptyDays:[],
    checkInDate:"",
    checkOutDate:"",
    isReady:false
  },

  attached(){
    console.log('month-calendar挂载,执行 init');
    this.initCalendar()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    initCalendar(){
      console.log("111111111111")
      const year = this.properties.year
      const month=this.properties.month
      // 获取当月第一天是星期几（0=周日，1=周一...6=周六）
      const firstDay=new Date(year,month-1,1).getDay()
      // 获取当月总天数
      const totalDays = new Date(year, month, 0).getDate()

      // this.data.emptyDays=firstDay
      const days=[]
      const emptyDays=[]
      for(let i =0;i<firstDay;i++)
        emptyDays.push('')
      
      console.log("emptydays done")
      
      for(let i=1;i<=totalDays;i++){
        const date = `${year}-${month.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        console.log('date:',date)
        days.push({
          date:date,
          day:i
        })
      }

      this.setData({
        days:days,
        emptyDays:emptyDays,
        checkIn:this.properties.defaultCheckInDate,
        checkOut:this.properties.defaultCheckOutDate,
        isReady:true
      })
      console.log('month-calendar isReady:',this.data.isReady)

    },

    isBetween(date){
      const checkIn=this.data.checkIn
      const checkOut=this.data.checkOut
      if (!checkIn || !checkOut) 
        return false
      return date > checkIn && date < checkOut
    },

    isDisabled(date){
      const today = new Date().toISOString().split('T')[0]; // 今日日期（YYYY-MM-DD）
      return date < today;
    },

    selectDate(e){
      const selectDate = e.currentTarget.dataset.date;
      const checkIn=this.data.checkIn
      const checkOut=this.data.checkOut

      // 未选择入住：选择入住
      if(!checkIn){
        this.setData({
          checkIn:selectDate
        })
      }else if(!checkOut){
        //已选择入住未选择离店

        //重新选择入住
        if (selectDate < checkIn){
          this.setData({
            checkIn:selectDate
          })
        }
        //取消入住
        else if(selectDate == checkIn){
          this.setData({
            checkIn:''
          })
        }
        //正常选择离店日期
        else{
          this.setData({
            checkOut:selectDate
          })

          this.confirmDate()
        }
      }
      //适用于一开始进去：选择入住日期
      else{
        this.setData({
          checkIn:selectDate
        })
      }
    },

    confirmDate(){
      const checkIn=this.data.checkIn
      const checkOut=this.data.checkOut
      if (!checkIn || !checkOut) 
        return;

      this.triggerEvent('confirm',{
        checkInDate:checkIn,
        checkOutDate:checkOut
      })
      
    }
  }
})