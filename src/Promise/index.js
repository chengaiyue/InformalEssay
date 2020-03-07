const PENDING = 'Pending';
const FUFILLEd = 'Fufilled';
const REJECTED = 'Rejected';

class PerPromise {
  constructor(fun) {
    if (typeof fun !== 'function') {
      console.error('----');
    }
    this.state = PENDING;
    this.value = null;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = value => {
      setTimeout(() => {
        if (this.state === PENDING) {
          this.state = FUFILLEd;
          this.value = value
          this.onFulfilledCallbacks.forEach(cb => {
            this.value = cb(this.value);
          });
        }
      });
    }

    const reject = reason => {
      setTimeout(() => {
        if (this.state === PENDING) {
          this.state = REJECTED;
          this.reason = reason;
          this.onRejectedCallbacks.forEach(cb => {
            this.reason = cb(this.reason);
          })
        }
      });
    }

    try {
      fun(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  then = (onFulfilled, onRejected) => {
    // typeof onFulfilled === 'function' && this.onFulfilledCallbacks.push(onFulfilled);
    // typeof onRejected === 'function' && this.onRejectedCallbacks.push(onRejected);
    // return this;
    let self = this;
    let newPromise = new PerPromise((resolve, reject) => {
      if (self.state === FUFILLEd) {
        setTimeout(() => {
          try {
            let x = onFulfilled(self.value);
            resolvePromise(newPromise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
      if (self.state === REJECTED) {
        setTimeout(() => {
          try {
            let x = reject(self.reason);
            resolvePromise(newPromise, x, resolve, reject)
          } catch (e) {
            reject(e);
          }
        });
      }
      if (self.state === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(self.value);
              resolvePromise(newPromise, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = reject(self.reason);
              resolvePromise(newPromise, x, resolve, reject)
            } catch (e) {
              reject(e);
            }
          });
        });
      }
    });
    return newPromise;
  }

}

function resolvePromise(promise2, x, resolve, reject) {
  // let self = this;
  if (promise2 === x) {
    reject(new TypeError('循环引用'));
  }

}

export default PerPromise;