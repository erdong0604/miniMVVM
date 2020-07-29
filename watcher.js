
// 给每一个元素添加一个观察者
//  对比新值和旧值， 如果发现值改变了 就更新对象的元素的值
class Watcher{
    // vm mvvm实例
    // expr 绑定的标识  eg:v-model="expr"
    // cb 对比新值和旧值不同后调用的回到函数
    constructor(vm,expr,cb){
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;

        // 在添加watcher时就获取当前的值(也就是旧值)。
        this.value = this.get();
    }
    // 在data中获取 message.a.b 的值
    getVal(vm,expr){
        expr = expr.split('.');
        return expr.reduce((perv,next) => {
            return perv[next];
        },vm.$data)
    }
    get(){
        // 在实例watcher时, 将当前的watcher实例放到Dep.target上。
        Dep.target = this;
        let value =  this.getVal(this.vm,this.expr);
        Dep.target = null;
        return value;
    } 
    // 如果对比两次的值不一致，则调用cb
    update() {
        let newValue = this.getVal(this.vm,this.expr);
        if(newValue !== this.value){
            this.cb(newValue);
        }
    }
}