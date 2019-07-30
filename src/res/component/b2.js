// 注册
Vue.component('cb2', {
    template: '<div><p>text:{{text}}#{{unicomId}}</p><p>msg: {{msg}}</p></div>',
    unicomName: ['b', 'b2'],
    unicom: {
        message: function({data}){
            this.msg = data
        }
    },
    data: function(){
        return {
            text: 'component - cb2',
            msg: ''
        }
    }
})