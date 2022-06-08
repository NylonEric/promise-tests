// tests to confirm details of promise chain error handling (aka JUST ASKING QUESTIONS!)

describe('Promise chain tests', () => {
  let my_mock_result;
  let my_mock_error;
  const async_promise = new Promise((resolve, reject) => {
    try{
      setTimeout( function() {
        resolve('async success!');
      }, 250);
    } catch(err) {
      reject(err);
    }
  });

  beforeEach(() => {
    my_mock_result = jest.fn();
    my_mock_error = jest.fn();
  });

  it('should call mock functions at each then block of promise chain', async () => {    
    await async_promise
    .then(response => {
      my_mock_result(); // first function call
      expect(response).toEqual('async success!');
      return response;
    })
    .then(response => {
      my_mock_result(); // second function call
      return response;
    })
    .catch(() => {
      my_mock_error(); // first error call
    })
    .finally(response => {
      my_mock_result(); // third function call
      return response;
    });

    expect(my_mock_result).toHaveBeenCalled();
    expect(my_mock_result).toHaveBeenCalledTimes(3);
    expect(my_mock_error).not.toHaveBeenCalled();
    expect(my_mock_error).toHaveBeenCalledTimes(0);
  });

  it('should call mock error function when error is caught in final catch block', async () => {
    await async_promise
    .then(response => {
      my_mock_result(); // first function call
      throw new Error('here is error');
      expect(response).toEqual('async success!'); // these are never reached
      return response; // also not reached
    })
    .then(response => {
      my_mock_result(); // second function call doesn't happen
      return response;
    })
    .catch(() => {
      my_mock_error(); // first error call
    })
    .finally(response => {
      my_mock_result(); // second function call happens even when error is thrown/caught
      return response;
    });

    expect(my_mock_result).toHaveBeenCalled();
    expect(my_mock_result).toHaveBeenCalledTimes(2);
    expect(my_mock_error).toHaveBeenCalled();
    expect(my_mock_error).toHaveBeenCalledTimes(1);
  });

  it('should continue in promise chain after error is caught in early catch block', async () => {
    await async_promise
    .then(response => {
      my_mock_result(); // first function call
      throw new Error('here is error');
      return response;
    })
    .then(response => {
      my_mock_result(); // second function call never happens
      return response;
    })
    .catch(() => {
      my_mock_error(); // first error call
    })
    .then(response => {
      my_mock_result(); // second function call because chain continues after catch block
      return response;
    })
    .catch(() => {
      my_mock_error(); // won't be called because error was caught earlier in chain
    })
    .finally(response => {
      my_mock_result(); // third function call happens even when error is thrown/caught
      return response;
    });

    expect(my_mock_result).toHaveBeenCalled();
    expect(my_mock_result).toHaveBeenCalledTimes(3);
    expect(my_mock_error).toHaveBeenCalled();
    expect(my_mock_error).toHaveBeenCalledTimes(1);
  });

  it('should catch both thrown errors in subsequent catch blocks', async () => {
    await async_promise
    .then(response => {
      my_mock_result(); // first function call
      throw new Error('here is error');
      return response;
    })
    .then(response => {
      my_mock_result(); // second function call doesn't happen
      return response;
    })
    .catch(() => {
      my_mock_error(); // first error call
    })
    .then(response => {
      my_mock_result(); // second function call because chain continues after catch
      throw new Error('error');
      return response;
    })
    .catch(() => {
      my_mock_error(); // catches 2nd error throw
    })
    .finally(response => {
      my_mock_result(); // third function call happens even when error is thrown/caught
      return response;
    });

    expect(my_mock_result).toHaveBeenCalled();
    expect(my_mock_result).toHaveBeenCalledTimes(3);
    expect(my_mock_error).toHaveBeenCalled();
    expect(my_mock_error).toHaveBeenCalledTimes(2);
  });

  it('should catch thrown errors when thrown from catch block', async () => {
    await async_promise
    .then(response => {
      my_mock_result(); // first function call
      throw new Error('here is error');
      return response;
    })
    .then(response => {
      my_mock_result(); // never reached
      return response;
    })
    .catch(err => {
      my_mock_error(); // first error call
      throw new Error(err);
    })
    .then(response => {
      my_mock_result(); // never reached
      return response;
    })
    .catch(() => {
      my_mock_error(); // catches 2nd error throw
    })
    .finally(response => {
      my_mock_result(); // third function call happens even when error is thrown/caught
      return response;
    });

    expect(my_mock_result).toHaveBeenCalled();
    expect(my_mock_result).toHaveBeenCalledTimes(2);
    expect(my_mock_error).toHaveBeenCalled();
    expect(my_mock_error).toHaveBeenCalledTimes(2);
  });

  it('should throw errors thrown after catch block', () => {
    expect(() => {
      return async_promise
      .then(response => {
        my_mock_result(); // first function call
        throw new Error('here is error');
        return response;
      })
      .then(response => {
        my_mock_result(); // never reached
        return response;
      })
      .catch(() => {
        my_mock_error(); // first error call
      })
      .then(() => {
        my_mock_result(); // second function call
        throw new Error('unhandled error'); // ! This error will not be handled by promise chain and will bubble up to the scope calling the function
      })
      .finally(response => {
        my_mock_result(); // third function call happens even when error is thrown/caught
        return response;
      });
    }).rejects.toThrow('unhandled error');
  });
});