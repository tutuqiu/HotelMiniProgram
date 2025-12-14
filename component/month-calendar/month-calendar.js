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
    },
    needPrice:{
      type:Boolean
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
    isReady:false,
    today:'',
    needPrice:''
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
      const today = new Date().toISOString().split('T')[0]

      const year = this.properties.year
      const month=this.properties.month
      console.log(`month-calendar:${year}-${month}`)
      // 获取当月第一天是星期几（0=周日，1=周一...6=周六）
      const firstDay=new Date(year,month-1,1).getDay()
      // 获取当月总天数
      const totalDays = new Date(year, month, 0).getDate()

      // this.data.emptyDays=firstDay
      const days=[]
      const emptyDays=[]
      for(let i =0;i<firstDay;i++)
        emptyDays.push('')
          
      for(let i=1;i<=totalDays;i++){
        const date = `${year}-${month.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        days.push({
          date:date,
          day:i,
          price:''
        })
      }

      this.setData({
        days:days,
        emptyDays:emptyDays,
        checkInDate:this.properties.defaultCheckInDate,
        checkOutDate:this.properties.defaultCheckOutDate,
        isReady:true,
        today:today,
        needPrice:this.properties.needPrice
      })
      console.log('month-calendar isReady:',this.data.isReady)

    },
    async selectDate(e){
      const checkIn=this.data.checkInDate
      const checkOut=this.data.checkOutDate
      console.log('checkIn:',checkIn)
      console.log('checkOut:',checkOut)

      const selectDate = e.currentTarget.dataset.date;
      console.log('selectDate:',selectDate)

      // 未选择入住：选择入住
      if(!checkIn){
        this.setData({
          checkInDate:selectDate
        })
        this.callUpdate()
      }else if(!checkOut){
        //已选择入住未选择离店
        //重新选择入住
        if (selectDate < checkIn){
          this.setData({
            checkInDate:selectDate
          })
          this.callUpdate()

          console.log('checkInDate:',this.data.checkInDate)
          console.log('checkOutDate:',this.data.checkOutDate)
        }
        //取消入住
        else if(selectDate == checkIn){
          this.setData({
            checkInDate:''
          })
          this.callUpdate()

          console.log('checkInDate:',this.data.checkInDate)
          console.log('checkOutDate:',this.data.checkOutDate)
        }
        //正常选择离店日期
        else{
          this.setData({
            checkOutDate:selectDate
          })
          this.callUpdate()
          console.log('checkInDate:',this.data.checkInDate)
          console.log('checkOutDate:',this.data.checkOutDate)
          await new Promise((resolve, reject)=> setTimeout(resolve, 1000));
          this.confirmDate()
        }
      }
      //适用于一开始进去：选择入住日期
      else{
        this.setData({
          checkInDate:selectDate,
          checkOutDate:''
        })
        this.callUpdate()
        console.log('checkInDate:',this.data.checkInDate)
        console.log('checkOutDate:',this.data.checkOutDate)
      }
    },

    updateDate(checkIn,checkOut){
      this.setData({
        checkInDate:checkIn,
        checkOutDate:checkOut
      })
      const year=this.data.year
      const month=this.data.month
      console.log(`calendar ${{year}}-${{month}}:In ${{checkIn}} Out${{checkOut}}`)
    },
    callUpdate(){
      console.log('callupdate start')
      this.triggerEvent('update',{
        checkInDate:this.data.checkInDate,
        checkOutDate:this.data.checkOutDate
      })
      console.log('callupdate done')
    },
    confirmDate(){
      const checkIn=this.data.checkInDate
      const checkOut=this.data.checkOutDate
      if (!checkIn || !checkOut) 
        return;

      this.triggerEvent('confirm',{
        checkInDate:checkIn,
        checkOutDate:checkOut
      })
      
    }
  }
})