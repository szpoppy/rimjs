// 注册
Vue.component('ca', {
    template: '<div><p>text:{{text}}#{{unicomId}}</p><p>msg: {{msg}}</p></div>',
    unicomName: 'a',
    unicom: {
        message: function({data}){
            this.msg = data
        }
    },
    data: function(){
        return {
            text: 'component - ca',
            msg: ''
        }
    }
})