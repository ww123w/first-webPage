const todoInput = document.querySelector('.todo-input');
const addButton = document.querySelector('.button');
const todoList = document.querySelector('.todo-list');

addButton.addEventListener('click', function ()
    {
        addTodo();
    }
);//'click'：第一个参数是事件的类型。这是一个字符串，告诉耳朵要听什么声音。这里是 'click'（点击事件）。其他还有 'mouseover' (鼠标悬停), 'keydown' (键盘按下) 等。

function addTodo()
{
    const todoText = todoInput.value.trim();//创建一个叫 todoText 的常量，把输入框里的文字拿出来，清理掉两头的空格，然后存进去

    if (todoText === '') {
        alert("你必须输入内容!");//浏览器内置的函数，会弹出一个简单的警告框，显示括号里的文字。
        return;
    }
 
    const newTodoHTML = `
        <div class="item">
            <div>
                <input type="checkbox">
                <span class="name">${todoText}</span>
            </div>
            <div class="del">del</div>
        </div>
    `;//反引号开启了一个叫做“模板字符串”的功能。

    todoList.insertAdjacentHTML('beforeend', newTodoHTML);//把一段 HTML 字符串插入到指定的位置。
    //'beforeend' 的意思是“在元素的内部，但在所有现有子元素的后面”。就像是在购物清单的末尾再加一项

    todoInput.value = '';
}

//删除事项
todoList.addEventListener('click', function (event) {
    if (event.target.classList.contains('del')) {
        const itemToDelete = event.target.closest('.item');
        itemToDelete.remove();
    }

    if (event.target.type === 'checkbox') {
        const itemToToggle = event.target.closest('.item');
        itemToToggle.classList.toggle('completed');
        //它会检查 itemToToggle 元素的 class 列表：
        // 如果没有 'completed' 这个 class，它就加上。
        // 如果已经有 'completed' 这个 class，它就去掉。
    }
});
