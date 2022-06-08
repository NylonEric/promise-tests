describe('Nested Promise chain tests', () => {
  const my_mock_result = jest.fn();
  const my_mock_error = jest.fn();

  beforeEach(() => {
    my_mock_result.mockClear();
    my_mock_error.mockClear();
  });

  it('should `catch` on Promise if `reject` is invoked', async () => {
    await new Promise((resolve, reject) => {
      reject();
    })
      .then(() => {
        my_mock_result();
      })
      .catch(() => {
        my_mock_error();
      });

    expect(my_mock_result).not.toHaveBeenCalled();
    expect(my_mock_error).toHaveBeenCalled();
  });

  it('should `catch` on outer Promise if `reject` is invoked within inner Promise', async () => {
    await new Promise((resolve, reject) => {
      new Promise(() => {
        reject();
      });
    })
      .then(() => {
        my_mock_result();
      })
      .catch(() => {
        my_mock_error();
      });

    expect(my_mock_result).not.toHaveBeenCalled();
    expect(my_mock_error).toHaveBeenCalled();
  });

  it('should `catch` on outer Promise if `reject` is invoked within returned inner Promise', async () => {
    await new Promise((resolve, reject) => {
      return new Promise(() => {
        reject();
      });
    })
      .then(() => {
        my_mock_result();
      })
      .catch(() => {
        my_mock_error();
      });

    expect(my_mock_result).not.toHaveBeenCalled();
    expect(my_mock_error).toHaveBeenCalled();
  });

  it('should `catch` on outer Promise if an invoked `reject` is returned within returned inner Promise', async () => {
    await new Promise((resolve, reject) => {
      return new Promise(() => {
        return reject();
      });
    })
      .then(() => {
        my_mock_result();
      })
      .catch(() => {
        my_mock_error();
      });

    expect(my_mock_result).not.toHaveBeenCalled();
    expect(my_mock_error).toHaveBeenCalled();
  });

  it('should not `catch` on inner Promise if `reject` invoked in inner Promise', async () => {
    await new Promise((resolve, reject) => {
      new Promise(() => {
        reject();
      })
        .then(() => {
          my_mock_result('inner promise');
        })
        .catch(() => {
          my_mock_error('inner promise');
        });
    })
      .then(() => {
        my_mock_result('outer promise');
      })
      .catch(() => {
        my_mock_error('outer promise');
      });

    expect(my_mock_result).not.toHaveBeenCalled();
    expect(my_mock_result).not.toHaveBeenCalledWith('inner promise');
    expect(my_mock_error).toHaveBeenCalled();
    expect(my_mock_error).toHaveBeenCalledWith('outer promise');
    expect(my_mock_error).not.toHaveBeenCalledWith('inner promise');
  });

  it('should not `catch` on inner Promise if `reject` invoked in returned inner Promise', async () => {
    await new Promise((resolve, reject) => {
      return new Promise(() => {
        reject();
      })
        .then(() => {
          my_mock_result('inner promise');
        })
        .catch(() => {
          my_mock_error('inner promise');
        });
    })
      .then(() => {
        my_mock_result('outer promise');
      })
      .catch(() => {
        my_mock_error('outer promise');
      });

    expect(my_mock_result).not.toHaveBeenCalled();
    expect(my_mock_result).not.toHaveBeenCalledWith('inner promise');
    expect(my_mock_error).toHaveBeenCalled();
    expect(my_mock_error).toHaveBeenCalledWith('outer promise');
    expect(my_mock_error).not.toHaveBeenCalledWith('inner promise');
  });

  it('should not `catch` on inner Promise if invoked `reject` is returned within returned inner Promise', async () => {
    await new Promise((resolve, reject) => {
      return new Promise(() => {
        return reject();
      })
        .then(() => {
          my_mock_result('inner promise');
        })
        .catch(() => {
          my_mock_error('inner promise');
        });
    })
      .then(() => {
        my_mock_result('outer promise');
      })
      .catch(() => {
        my_mock_error('outer promise');
      });

    expect(my_mock_result).not.toHaveBeenCalled();
    expect(my_mock_result).not.toHaveBeenCalledWith('inner promise');
    expect(my_mock_error).toHaveBeenCalled();
    expect(my_mock_error).toHaveBeenCalledWith('outer promise');
    expect(my_mock_error).not.toHaveBeenCalledWith('inner promise');
  });

  it('should not continue with inner Promise if `resolve` invoked in returned inner Promise', async () => {
    await new Promise((resolve, reject) => {
      new Promise(() => {
        resolve();
      })
        .then(() => {
          my_mock_result('inner promise');
        })
        .catch(() => {
          my_mock_error('inner promise');
        });
    })
      .then(() => {
        my_mock_result('outer promise');
      })
      .catch((err) => {
        my_mock_error('outer promise');
      });

    expect(my_mock_result).toHaveBeenCalled();
    expect(my_mock_result).toHaveBeenCalledWith('outer promise');
    expect(my_mock_result).not.toHaveBeenCalledWith('inner promise');
    expect(my_mock_error).not.toHaveBeenCalled();
  });

  it('should not continue with inner Promise if invoked `resolve` is returned within inner Promise', async () => {
    await new Promise((resolve, reject) => {
      new Promise(() => {
        return resolve();
      })
        .then(() => {
          my_mock_result('inner promise');
        })
        .catch(() => {
          my_mock_error('inner promise');
        });
    })
      .then(() => {
        my_mock_result('outer promise');
      })
      .catch((err) => {
        my_mock_error('outer promise');
      });

    expect(my_mock_result).toHaveBeenCalled();
    expect(my_mock_result).toHaveBeenCalledWith('outer promise');
    expect(my_mock_result).not.toHaveBeenCalledWith('inner promise');
    expect(my_mock_error).not.toHaveBeenCalled();
  });

  it('should continue in current scope of inner Promise if `resolve` or `reject` of outer Promise is run', async () => {
    await new Promise((resolve, reject) => {
      new Promise(() => {
        reject();
        my_mock_result('inside the inner promise');
      });
    })
      .then(() => {
        my_mock_result('outer promise');
      })
      .catch((err) => {
        my_mock_error('outer promise');
      });

    expect(my_mock_result).toHaveBeenCalled();
    expect(my_mock_result).toHaveBeenCalledWith('inside the inner promise');
    expect(my_mock_error).toHaveBeenCalled();
    expect(my_mock_error).toHaveBeenCalledWith('outer promise');
  });

  it('should continue in current scope of inner Promise if `reject` of inner Promise is run', async () => {
    await new Promise((resolve, reject) => {
      new Promise((inner_resolve, inner_reject) => {
        reject();
        my_mock_result('first inside inner promise');
        inner_reject();
        my_mock_result('second inside inner promise');
      })
        .then(() => {
          my_mock_result('then in inner promise');
        })
        .catch(() => {
          my_mock_error('catch in inner promise');
        });
    })
      .then(() => {
        my_mock_result('outer promise');
      })
      .catch((err) => {
        my_mock_error('outer promise');
      });

    expect(my_mock_result).toHaveBeenCalledTimes(2);
    expect(my_mock_result).toHaveBeenCalledWith('first inside inner promise');
    expect(my_mock_result).toHaveBeenCalledWith('second inside inner promise');
    expect(my_mock_error).toHaveBeenCalledTimes(2);
    expect(my_mock_error).toHaveBeenCalledWith('catch in inner promise');
    expect(my_mock_error).toHaveBeenCalledWith('outer promise');
  });

  it('should not continue in current scope of inner Promise after a return statement', async () => {
    await new Promise((resolve, reject) => {
      new Promise((inner_resolve, inner_reject) => {
        reject();
        my_mock_result('first inside inner promise');
        return inner_reject();
        my_mock_result('second inside inner promise');
      })
        .then(() => {
          my_mock_result('then inside inner promise');
        })
        .catch(() => {
          my_mock_error('catch inside inner promise');
        });
    })
      .then(() => {
        my_mock_result('outer promise');
      })
      .catch((err) => {
        my_mock_error('outer promise');
      });

    expect(my_mock_result).toHaveBeenCalledTimes(1);
    expect(my_mock_result).toHaveBeenCalledWith('first inside inner promise');
    expect(my_mock_result).not.toHaveBeenCalledWith('second inside inner promise');
    expect(my_mock_error).toHaveBeenCalledTimes(2);
    expect(my_mock_error).toHaveBeenCalledWith('catch inside inner promise');
    expect(my_mock_error).toHaveBeenCalledWith('outer promise');
  });
});

