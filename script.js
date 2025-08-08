const todoInput = document.querySelector('.todo-input');
const addButton = document.querySelector('.button');
const todoListContainer = document.querySelector('.todo-list');

// // 新增！找到进度条和百分比文本的“遥控器”
// const progressBar = document.querySelector('.progress-bar');
// const progressText = document.querySelector('.progress-text');

const API_BASE_URL = 'http://localhost:3000';

// --- 核心渲染函数 ---
/**
 * 根据传入的 todos 数组，重新渲染整个待办事项列表
 * @param {Array} todos - 包含待办事项对象的数组
 */
const renderTodos = (todos) => {
    todoListContainer.innerHTML = '';//先清空当前的列表容器，防止重复添加

    todos.forEach(todo => {
        const itemClass = todo.completed ? 'item completed' : 'item';//用一个三元运算符来决定是否添加 'completed' class
        const checkedAttribute = todo.completed ? 'checked' : '';//用一个三元运算符来决定 checkbox 是否被勾选

        const todoItemHTML =
            `
            <div class="${itemClass}" data-id="${todo.id}">
                <div>
                    <input type="checkbox" ${checkedAttribute}>
                    <span class="name">${todo.text}</span>
                </div>
                <div class="del">del</div>
            </div>
        `;

        todoListContainer.insertAdjacentHTML('beforeend', todoItemHTML);//把新创建的 HTML 字符串追加到容器里
    });
};

//async 函数让我们能用 await “暂停”代码，等待 fetch 的结果
const fetchAndRenderTodos = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/todos`);

        if (!response.ok) {
            throw new Error(`网络响应错误: ${response.statusText}`);
        }

        const todos = await response.json();//将响应体解析为 JSON

        renderTodos(todos);
    } catch (error) {
        console.error('获取待办事项失败:', error);
        todoListContainer.innerHTML = '<p>加载列表失败，请稍后再试。</p>';
    }
};

//页面加载时，自动执行一次获取和渲染
//DOMContentLoaded 事件：这个事件会在整个 HTML 文档被完全加载和解析完成后触发，是执行初始化 JavaScript 代码最安全、最推荐的时机。
document.addEventListener('DOMContentLoaded', fetchAndRenderTodos);

//添加新的待办 
const addTodo = async () => {
    const text = todoInput.value.trim();
    if (text === '') {
        alert('请输入任务内容！');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({ text: text }),
        });

        if (!response.ok) {
            throw new Error('添加任务失败');
        }

        // 添加成功后，清空输入框
        todoInput.value = '';
        // 然后重新获取整个列表并渲染，这是最简单的更新UI的方式
        fetchAndRenderTodos();
    } catch (error) {
        console.error('添加任务时出错:', error);
        alert('添加失败，请检查网络或联系管理员。');
    }
};

addButton.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addTodo();
    }
});

//===================================================================

//删除和更新待办事项
todoListContainer.addEventListener('click', async (event) => {
    const target = event.target;//用户实际点击的那个元素

    if (target.classList.contains('del')) {
        const item = target.closest('.item');

        const todoId = item.dataset.id;

        try {
            const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('删除失败');
            }

            item.remove();
            // fetchAndRenderTodos();  //重新加载整个列表，逻辑更简单，但会有一点延迟
        } catch (error) {
            console.error('删除任务时出错:', error);
            alert('删除失败，请稍后再试。');
        }
    }

    if (target.type === 'checkbox') {
        const item = target.closest('.item');
        const todoId = item.dataset.id;

        try {
            const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
                method: 'PATCH',
            });
            
            if (!response.ok) {
                throw new Error('更新状态失败');
            }

            item.classList.toggle('completed');
        } catch (error) {
            console.error('更新状态时出错:', error);
            alert('更新失败，请稍后再试。');
            // 如果更新失败，把 checkbox 的状态恢复原状，防止UI与数据不一致
            target.checked = !target.checked;
        }
    }
});