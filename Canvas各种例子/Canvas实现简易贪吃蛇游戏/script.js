
draw()

function draw() {
    const canvas = document.getElementById('canvas')

    const ctx = canvas.getContext('2d')

    // 定义一个全局的是否吃到食物的一个变量
    let isEatFood = false

    // 小方格的构造函数
    function Rect(x, y, width, height, color) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
    }

    Rect.prototype.draw = function () {
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
        ctx.strokeRect(this.x, this.y, this.width, this.height)
    }

    // 蛇的构造函数
    function Snake(length = 0) {

        this.length = length
        // 蛇头
        this.head = new Rect(canvas.width / 2, canvas.height / 2, 40, 40, 'red')

        // 蛇身
        this.body = []

        let x = this.head.x - 40
        let y = this.head.y

        for (let i = 0; i < this.length; i++) {
            const rect = new Rect(x, y, 40, 40, 'yellow')
            this.body.push(rect)
            x -= 40
        }
    }

    Snake.prototype.drawSnake = function () {
        // 如果碰到了
        if (isHit(this)) {
            // 清除定时器
            clearInterval(timer)
            const con = confirm(`总共吃了${this.body.length - this.length}个食物，重新开始吗`)
            // 是否重开
            if (con) {
                draw()
            }
            return
        }
        // 绘制蛇头
        this.head.draw()
        // 绘制蛇身
        for (let i = 0; i < this.body.length; i++) {
            this.body[i].draw()
        }
    }

    Snake.prototype.moveSnake = function () {
        // 将蛇头上一次状态，拼到蛇身首部
        const rect = new Rect(this.head.x, this.head.y, this.head.width, this.head.height, 'yellow')
        this.body.unshift(rect)

        // 判断蛇头是否与食物重叠，重叠就是吃到了，没重叠就是没吃到
        isEatFood = food && this.head.x === food.x && this.head.y === food.y

        // 咱们上面在蛇身首部插入方格
        if (!isEatFood) {
            // 没吃到就要去尾，相当于整条蛇没变长
            this.body.pop()
        } else {
            // 吃到了就不去尾，相当于整条蛇延长一个方格

            // 并且吃到了，就要重新生成一个随机食物
            food = randomFood(this)
            food.draw()
            isEatFood = false
        }

        // 根据方向，控制蛇头的坐标
        switch (this.direction) {
            case 0:
                this.head.x -= this.head.width
                break
            case 1:
                this.head.y -= this.head.height
                break
            case 2:
                this.head.x += this.head.width
                break
            case 3:
                this.head.y += this.head.height
                break
        }
    }

    document.onkeydown = function (e) {
        // 键盘事件
        e = e || window.event
        // 左37  上38  右39  下40
        switch (e.keyCode) {
            case 37:
                console.log(37)
                // 三元表达式，防止右移动时按左，下面同理(贪吃蛇可不能直接掉头)
                snake.direction = snake.direction === 2 ? 2 : 0
                snake.moveSnake()
                break
            case 38:
                console.log(38)
                snake.direction = snake.direction === 3 ? 3 : 1
                break
            case 39:
                console.log(39)
                snake.direction = snake.direction === 0 ? 0 : 2
                break
            case 40:
                console.log(40)
                snake.direction = snake.direction === 1 ? 1 : 3
                break

        }
    }

    function randomFood(snake) {
        let isInSnake = true
        let rect
        while (isInSnake) {
            const x = Math.round(Math.random() * (canvas.width - 40) / 40) * 40
            const y = Math.round(Math.random() * (canvas.height - 40) / 40) * 40
            console.log(x, y)
            // 保证是40的倍数啊
            rect = new Rect(x, y, 40, 40, 'blue')
            // 判断食物是否与蛇头蛇身重叠
            if ((snake.head.x === x && snake.head.y === y) || snake.body.find(item => item.x === x && item.y === y)) {
                isInSnake = true
                continue
            } else {
                isInSnake = false
            }
        }
        return rect
    }

    function isHit(snake) {
        const head = snake.head
        // 是否碰到左右边界
        const xLimit = head.x < 0 || head.x >= canvas.width
        // 是否碰到上下边界
        const yLimit = head.y < 0 || head.y >= canvas.height
        // 是否撞到蛇身
        const hitSelf = snake.body.find(({ x, y }) => head.x === x && head.y === y)
        // 三者其中一个为true则游戏结束
        return xLimit || yLimit || hitSelf
    }

    const snake = new Snake(3)
    // 默认direction为2，也就是右
    snake.direction = 2
    snake.drawSnake()
    // 创建随机食物实例
    var food = randomFood(snake)
    // 画出食物
    food.draw()

    function animate() {
        // 先清空
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        // 移动
        snake.moveSnake()
        // 再画
        snake.drawSnake()
        food.draw()
    }

    var timer = setInterval(() => {
        animate()
    }, 1000)
}