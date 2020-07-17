# reversible-random.js
A "reversible" random number generator for JavaScript. It's able to generate the previous random number. Based on linear congruence.

一个 JavaScript 编写的“可逆”随机数生成器，能够生成前一个随机数。基于线性同余算法。

## 导入
直接将 `reversible-random.js` 文件复制到你的项目中，然后根据路径导入此模块即可。

***注意：为了保证计算的精确性，实现中使用了 JavaScript 新标准：`BigInt` 类。请确保开发环境和生产环境支持这一标准***。

### CommandJS 风格的导入
```js
var ReversibleRandom = require('./reversible-random.js').ReversibleRandom
```

### ES6 风格的导入
```js
import { ReversibleRandom } from './reversible-random.js'
```

## 使用

### 构造
可以直接使用一下方式构造一个随机数生成器：

```js
var RNG = ReversibleRandom()
```

也可以指定一组参数 $(a, c, m)$：

```js
var RNG = ReversibleRandom(a, c, m)
```

需要指出的是，当你使用第一种方式构造了随机数生成器，相当于：

```js
var RNG = ReversibleRandom(48271, 0, 2147483647)
```

因为这是它的默认参数。另外一组 js 中常用的参数是 `9301, 49297, 233280`

还可以指定第四项参数 `inv_a`（ $a_{inv}$ ），它是 $a$ 在模 $m$ 意义下的乘法逆元。也就是说，应当满足：

$$a \times a_{inv} \equiv 1 \mod m$$

如果不指定第四项参数，第四项参数将通过扩展欧几里得算法计算得出。由于这个过程耗时很短，因此完全无需指定第四项参数。

另外，如果指定的参数错误（也即不满足上述条件），或者 $a$ 与 $m$ 不互质（这样就不存在唯一确定的 $a_{inv}$ ），此模块将通过 console 发出警告。它能仍够工作，但是将不保证正常工作。建议人为确保 $a$ 和 $m$ 是互质的。

可以通过以下属性来得知最大可能生成的随机数：

```js
RNG.RAND_MAX
```

此 RNG 生成的随机数将等概率地落在 `[0, RAND_MAX]` 中。数值上，它等于 $(m-1)$。

### 生成随机数
如果把它当作一个普通的随机数生成器，则在构造之后，可以通过不断调用以下方法来生成随机数：

```js
var rand = RNG.next()
```

如果需要生成“上一个”随机数，只需要调用这个方法：

```js
var rand = RNG.prev()
```

实质上 `next()` 方法更改了 RNG 内部状态到“下一个”状态，同时把值返回出来。`prev()` 方法更改了 RNG 内部状态到“上一个”状态，同时把值返回出来。因此，你可以不断地调用 `next()`，再调用同样多次的 `prev()`（或者先调用 `prev()` 再调用 `next()` ）以回到当前状态。

此模块同时还提供了一个方法以使你可以得知当前的内部状态，并且不产生状态改变：

```js
var cur = RNG.curr()
```

同时，此模块也提供了一套简单的封装使得你可以利用它生成指定区间 `[min, max]` 上的随机数：

```js
RNG.rangeNext(min, max)
RNG.rangePrev(min, max)
RNG.rangeCurr(min, max)
```

这是通过取模的方法来完成的，因此同样保证 `rangeNext(min, max)` 任意次后再 `rangePrev(min, max)` 相同次数就可以得到 `rangeCurr(min, max)`（ `min` 和 `max` 应该始终保持统一）。但是 `min` 和 `max` 的大小关系必须自行保证，此模块不会进行检查。

### 设置起始值
此模块允许你为随机数序列指定一个起始值，也就是说指定一个初始状态。指定起始值的方法为：

```js
RNG.setInitial(i)
```

如果 `i` 落在 `[0, RAND_MAX]` 之外，模块将通过 console 发出警告。此时此模块不保证正常工作。此方法可以随时被调用，状态改变立即生效。

同时也提供了另一个方法，用以在某个区间上指定一个初始值：

```js
RNG.setRangeInitial(i, min, max)
```

如果 `i` 落在 `[min, max]` 之外，模块将通过 console 发出警告。此时此模块不保证正常工作。需要指出的是往往此时的 `i` 会对应着许多个不同的状态，它们都能保证 `rangeCurr(min, max)` 为 `i`。因此这个方法会随机挑选一个状态，从而保证多次调用这个方法后，可以尽量得到不同的随机数序列。