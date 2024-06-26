/* eslint guard-for-in: 0 no-loop-func: 0 */
import configureStore from '../../src/stores/grid-store';
import configureActions from '../../src/actions';
import { assert } from 'chai';

describe('store', () => {
  let store;
  const actions = configureActions();
  const showing = {
    field1: 'Object', field2: 'Array', field3: 'Int32',
    field4: 'Binary', field5: 'Mixed'
  };
  const columns = {
    field1: { '1': 'Object', '2': 'Object', '3': 'Object' },
    field2: { '1': 'Array', '2': 'Array', '3': 'Array' },
    field3: { '1': 'Int32', '2': 'Int32', '3': 'Int32' },
    field4: { '1': 'Binary', '2': 'Binary', '3': 'Binary'},
    field5: { '1': 'Int32', '2': 'Int32', '3': 'String' }
  };
  const arrayCols = {
    0: {id1: 'String', id2: 'Int64'},
    1: {id1: 'Int64', id2: 'Double'},
    2: {id1: 'Int32' }
  };
  const arrayShowing = {
    0: 'Mixed', 1: 'Mixed', 2: 'Int32'
  };

  describe('#columns', () => {
    describe('adding an array column', () => {
      describe('editOnly=true', () => {
        before((done) => {
          store = configureStore({ actions: actions });
          store.resetColumns(arrayCols);
          expect(store.columns).to.deep.equal(arrayCols);
          expect(store.showing).to.deep.equal(arrayShowing);
          done();
        });
        after((done) => {
          done();
        });
        it('does not trigger with add', (done) => {
          const unsubscribe = store.listen((params) => {
            unsubscribe();
            expect(params).to.deep.equal({
              updateHeaders: {showing: {1: 'Int64', 2: 'Mixed'} },
              edit: {colId: 1, rowIndex: 3}
            });
            done();
          });
          store.addColumn(1, 0, 3, ['array'], true, true, 'id2');
        });
        it('updates this.columns correctly', () => {
          expect(store.columns).to.deep.equal({
            0: {id1: 'String', id2: 'Int64'},
            1: {id1: 'Int64'},
            2: {id1: 'Int32', id2: 'Double'}
          });
        });
        it('updates this.showing correctly', () => {
          expect(store.showing).to.deep.equal({
            0: 'Mixed', 1: 'Int64', 2: 'Mixed'
          });
        });
      });
      describe('editOnly=false', () => {
        before((done) => {
          store = configureStore({ actions: actions });
          store.resetColumns(arrayCols);
          expect(store.columns).to.deep.equal(arrayCols);
          expect(store.showing).to.deep.equal(arrayShowing);
          done();
        });
        after((done) => {
          done();
        });
        it('does trigger with add', (done) => {
          const unsubscribe = store.listen((params) => {
            unsubscribe();
            expect(params).to.deep.equal({
              updateHeaders: {showing: {
                1: 'Double', 2: 'Int64', 3: 'Int32'
              }},
              add: {
                newColId: 1, colIdBefore: 0, path: ['array'], isArray: true, colType: ''
              },
              edit: {
                colId: 1, rowIndex: 3
              }
            });
            done();
          });
          store.addColumn(1, 0, 3, ['array'], true, false, 'id1');
        });
        it('updates this.columns correctly', () => {
          expect(store.columns).to.deep.equal({
            0: {id1: 'String', id2: 'Int64'},
            1: {id2: 'Double'},
            2: {id1: 'Int64'},
            3: {id1: 'Int32'}
          });
        });
        it('updates this.showing correctly', () => {
          expect(store.showing).to.deep.equal({
            0: 'Mixed', 1: 'Double', 2: 'Int64', 3: 'Int32'
          });
        });
      });
      describe('with elements marked as removed', () => {
        describe('editOnly=false', () => {
          describe('mark removed is same element as added', () => {
            before((done) => {
              store = configureStore({ actions: actions });
              store.resetColumns(arrayCols);
              store.elementMarkRemoved(1, 'id1');
              expect(store.columns).to.deep.equal({
                0: {id1: 'String', id2: 'Int64'},
                1: {id2: 'Double'},
                2: {id1: 'Int32' }
              });
              expect(store.showing).to.deep.equal({
                0: 'Mixed', 1: 'Double', 2: 'Int32'
              });
              expect(store.stageRemove).to.deep.equal({
                1: {id1: true}
              });
              done();
            });
            after((done) => {
              done();
            });
            it('does trigger with add', (done) => {
              const unsubscribe = store.listen((params) => {
                unsubscribe();
                expect(params).to.deep.equal({
                  updateHeaders: {showing: {
                    1: 'Double', 3: 'Int32'
                  }},
                  add: {
                    newColId: 1, colIdBefore: 0, path: ['array'], isArray: true, colType: ''
                  },
                  edit: {
                    colId: 1, rowIndex: 3
                  }
                });
                done();
              });
              store.addColumn(1, 0, 3, ['array'], true, false, 'id1');
            });
            it('updates this.columns correctly', () => {
              expect(store.columns).to.deep.equal({
                0: {id1: 'String', id2: 'Int64'},
                1: {id2: 'Double'},
                3: {id1: 'Int32'}
              });
            });
            it('updates this.showing correctly', () => {
              expect(store.showing).to.deep.equal({
                0: 'Mixed', 1: 'Double', 2: 'Int32', 3: 'Int32'
              });
            });
            it('updates this.stageRemoved correctly', () => {
              expect(store.stageRemove).to.deep.equal({
                2: {id1: true}
              });
            });
          });
          describe('mark removed is before added', () => {
            before((done) => {
              store = configureStore({ actions: actions });
              store.resetColumns(arrayCols);
              store.elementMarkRemoved(0, 'id1');
              expect(store.columns).to.deep.equal({
                0: {id2: 'Int64'},
                1: {id1: 'Int64', id2: 'Double'},
                2: {id1: 'Int32' }
              });
              expect(store.showing).to.deep.equal({
                0: 'Int64', 1: 'Mixed', 2: 'Int32'
              });
              expect(store.stageRemove).to.deep.equal({
                0: {id1: true}
              });
              done();
            });
            after((done) => {
              done();
            });
            it('does trigger with add', (done) => {
              const unsubscribe = store.listen((params) => {
                unsubscribe();
                expect(params).to.deep.equal({
                  updateHeaders: {showing: {
                    1: 'Double', 2: 'Int64', 3: 'Int32'
                  }},
                  add: {
                    newColId: 1, colIdBefore: 0, path: ['array'], isArray: true, colType: ''
                  },
                  edit: {
                    colId: 1, rowIndex: 3
                  }
                });
                done();
              });
              store.addColumn(1, 0, 3, ['array'], true, false, 'id1');
            });
            it('updates this.columns correctly', () => {
              expect(store.columns).to.deep.equal({
                0: {id2: 'Int64'},
                1: {id2: 'Double'},
                2: {id1: 'Int64'},
                3: {id1: 'Int32'}
              });
            });
            it('updates this.showing correctly', () => {
              expect(store.showing).to.deep.equal({
                0: 'Int64', 1: 'Double', 2: 'Int64', 3: 'Int32'
              });
            });
            it('updates this.stageRemoved correctly', () => {
              expect(store.stageRemove).to.deep.equal({
                0: {id1: true}
              });
            });
          });
          describe('mark removed is after added', () => {
            before((done) => {
              store = configureStore({ actions: actions });
              store.resetColumns(arrayCols);
              store.elementMarkRemoved(2, 'id1');
              expect(store.columns).to.deep.equal({
                0: {id1: 'String', id2: 'Int64'},
                1: {id1: 'Int64', id2: 'Double'}
              });
              expect(store.showing).to.deep.equal({
                0: 'Mixed', 1: 'Mixed', 2: 'Int32'
              });
              expect(store.stageRemove).to.deep.equal({
                2: {id1: true}
              });
              done();
            });
            after((done) => {
              done();
            });
            it('does trigger with add', (done) => {
              const unsubscribe = store.listen((params) => {
                unsubscribe();
                expect(params).to.deep.equal({
                  updateHeaders: {showing: {
                    1: 'Double', 2: 'Int64'
                  }},
                  add: {
                    newColId: 1, colIdBefore: 0, path: ['array'], isArray: true, colType: ''
                  },
                  edit: {
                    colId: 1, rowIndex: 3
                  }
                });
                done();
              });
              store.addColumn(1, 0, 3, ['array'], true, false, 'id1');
            });
            it('updates this.columns correctly', () => {
              expect(store.columns).to.deep.equal({
                0: {id1: 'String', id2: 'Int64'},
                1: {id2: 'Double'},
                2: {id1: 'Int64'}
              });
            });
            it('updates this.showing correctly', () => {
              expect(store.showing).to.deep.equal({
                0: 'Mixed', 1: 'Double', 2: 'Int64', 3: 'Int32'
              });
            });
            it('updates this.stageRemoved correctly', () => {
              expect(store.stageRemove).to.deep.equal({
                3: {id1: true}
              });
            });
          });
        });
      });
    });
    describe('adding a non-array column', () => {
      before((done) => {
        store = configureStore({ actions: actions });
        done();
      });
      after((done) => {
        done();
      });
      it('triggers with correct params', (done) => {
        const unsubscribe = store.listen((params) => {
          unsubscribe();
          expect(params).to.deep.equal({
            edit: { colId: 'field3', rowIndex: 1},
            add: {
              newColId: 'field3', colIdBefore: 'field1',
              path: ['path'], isArray: false, colType: ''
            }
          });
          done();
        });
        store.addColumn('field3', 'field1', 1, ['path'], false, false, 'id1');
      });
    });

    describe('removing a column', () => {
      it('triggers with correct params', (done) => {
        const unsubscribe = store.listen((params) => {
          unsubscribe();
          expect(params).to.deep.equal({remove: {colIds: ['field3']}});
          done();
        });
        store.removeColumn('field3');
      });
    });
  });

  describe('#resetCols', () => {
    before((done) => {
      store = configureStore({ actions: actions });
      showing.field5 = 'Mixed';
      done();
    });
    after((done) => {
      showing.field5 = 'Int32';
      done();
    });
    it('resets columns to empty', () => {
      store.resetColumns({});
      expect(store.columns).to.deep.equal({});
      expect(store.showing).to.deep.equal({});
      expect(store.stageRemove).to.deep.equal({});
    });
    it('resets columns to values', () => {
      store.resetColumns(columns);
      expect(store.columns).to.deep.equal(columns);
      expect(store.showing).to.deep.equal(showing);
      expect(store.stageRemove).to.deep.equal({});
    });
  });

  describe('#elementAdded', () => {
    before((done) => {
      store = configureStore({ actions: actions });
      done();
    });
    describe('Adding a new column', () => {
      for (const key in columns) {
        it('triggers correctly', (done) => {
          const unsubscribe = store.listen((params) => {
            unsubscribe();
            const show = {};
            show[key] = columns[key][1];
            expect(params).to.deep.equal({updateHeaders: {showing: show}});
            done();
          });
          store.elementAdded(key, columns[key]['1'], '1');
        });
      }
      it('sets this.columns correctly', () => {
        expect(store.columns).to.deep.equal({
          field1: {1: 'Object'},
          field2: {1: 'Array'},
          field3: {1: 'Int32'},
          field4: {1: 'Binary'},
          field5: {1: 'Int32'}
        });
      });
      it('sets this.showing correctly', () => {
        expect(store.showing).to.deep.equal(showing);
      });
    });

    describe('Adding to a column that already exists with the same type', () => {
      for (const key in columns) {
        it('does not trigger', () => {
          const unsubscribe = store.listen(() => {
            assert.fail();
          });
          store.elementAdded(key, columns[key]['2'], '2');
          if (key !== 'field5') {
            store.elementAdded(key, columns[key]['3'], '3');
          }
          unsubscribe();
        });
      }
      it('sets this.columns correctly', () => {
        expect(store.columns).to.deep.equal({
          field1: {1: 'Object', 2: 'Object', 3: 'Object'},
          field2: {1: 'Array', 2: 'Array', 3: 'Array'},
          field3: {1: 'Int32', 2: 'Int32', 3: 'Int32'},
          field4: {1: 'Binary', 2: 'Binary', 3: 'Binary'},
          field5: {1: 'Int32', 2: 'Int32'}
        });
      });
      it('sets this.showing correctly', () => {
        showing.field5 = 'Int32';
        expect(store.showing).to.deep.equal(showing);
        showing.field5 = 'Mixed';
      });
    });
    describe('Adding to a column that already exists with a new type', () => {
      it('triggers correctly', (done) => {
        const unsubscribe = store.listen((params) => {
          unsubscribe();
          expect(params).to.deep.equal({updateHeaders: {showing: {field5: 'Mixed'}}});
          done();
        });
        store.elementAdded('field5', 'String', '3');
      });
      it('sets this.columns correctly', () => {
        expect(store.columns).to.deep.equal(columns);
      });
      it('sets this.showing correctly', () => {
        expect(store.showing).to.deep.equal(showing);
      });
    });
  });

  describe('#elementRemoved', () => {
    describe('isArray=false', () => {
      before((done) => {
        store = configureStore({ actions: actions });
        store.resetColumns(columns);
        done();
      });
      describe('Removing from a column that already exists with the same type', () => {
        for (const key in columns) {
          it('does not trigger', () => {
            const unsubscribe = store.listen(() => {
              assert.fail();
            });
            store.elementRemoved(key, '1', false);
            if (key !== 'field5') {
              store.elementRemoved(key, '2', false);
            }
            unsubscribe();
          });
        }
        it('sets this.columns correctly', () => {
          expect(store.columns).to.deep.equal({
            field1: {3: 'Object'},
            field2: {3: 'Array'},
            field3: {3: 'Int32'},
            field4: {3: 'Binary'},
            field5: {2: 'Int32', 3: 'String'}
          });
        });
        it('sets this.showing correctly', () => {
          expect(store.showing).to.deep.equal(showing);
        });
      });
      describe('Removing from a Mixed column', () => {
        it('triggers correctly', (done) => {
          const unsubscribe = store.listen((params) => {
            unsubscribe();
            expect(params).to.deep.equal({updateHeaders: {showing: {field5: 'Int32'}}});
            done();
          });
          store.elementRemoved('field5', '3', false);
        });
        it('sets this.columns correctly', () => {
          expect(store.columns).to.deep.equal({
            field1: {3: 'Object'},
            field2: {3: 'Array'},
            field3: {3: 'Int32'},
            field4: {3: 'Binary'},
            field5: {2: 'Int32'}
          });
        });
        it('sets this.showing correctly', () => {
          showing.field5 = 'Int32';
          expect(store.showing).to.deep.equal(showing);
        });
      });
      describe('Removing the last item from a column', () => {
        it('triggers correctly', (done) => {
          const unsubscribe = store.listen((params) => {
            unsubscribe();
            expect(params).to.deep.equal({remove: {colIds: ['field5']}});
            done();
          });
          store.elementRemoved('field5', '2', false);
        });
        it('sets this.columns correctly', () => {
          expect(store.columns).to.deep.equal({
            field1: {3: 'Object'},
            field2: {3: 'Array'},
            field3: {3: 'Int32'},
            field4: {3: 'Binary'}
          });
        });
        it('sets this.showing correctly', () => {
          delete showing.field5;
          expect(store.showing).to.deep.equal(showing);
        });
      });
    });
    describe('isArray=true', () => {
      describe('from middle of array', () => {
        describe('last column is now empty', () => {
          before((done) => {
            store = configureStore({ actions: actions });
            store.resetColumns(arrayCols);
            expect(store.columns).to.deep.equal(arrayCols);
            expect(store.showing).to.deep.equal(arrayShowing);
            done();
          });
          after((done) => {
            done();
          });
          it('does trigger with remove', (done) => {
            const unsubscribe = store.listen((params) => {
              unsubscribe();
              expect(params).to.deep.equal({
                updateHeaders: {showing: {1: 'Mixed'} },
                refresh: {oid: 'id1'},
                remove: {colIds: [2]}
              });
              done();
            });
            store.elementRemoved(1, 'id1', true);
          });
          it('updates this.columns correctly', () => {
            expect(store.columns).to.deep.equal({
              0: {id1: 'String', id2: 'Int64'},
              1: {id1: 'Int32', id2: 'Double'}
            });
          });
          it('updates this.showing correctly', () => {
            expect(store.showing).to.deep.equal({
              0: 'Mixed', 1: 'Mixed'
            });
          });
        });
        describe('last column is not empty', () => {
          before((done) => {
            store = configureStore({ actions: actions });
            store.resetColumns(arrayCols);
            expect(store.columns).to.deep.equal(arrayCols);
            expect(store.showing).to.deep.equal(arrayShowing);
            done();
          });
          after((done) => {
            done();
          });
          it('does not trigger with remove', (done) => {
            const unsubscribe = store.listen((params) => {
              unsubscribe();
              expect(params).to.deep.equal({
                updateHeaders: {showing: {0: 'Mixed', 1: 'Int64', 2: 'Int32'} },
                refresh: {oid: 'id2'}
              });
              done();
            });
            store.elementRemoved(0, 'id2', true);
          });
          it('updates this.columns correctly', () => {
            expect(store.columns).to.deep.equal({
              0: {id1: 'String', id2: 'Double'},
              1: {id1: 'Int64'},
              2: {id1: 'Int32'}
            });
          });
          it('updates this.showing correctly', () => {
            expect(store.showing).to.deep.equal({
              0: 'Mixed', 1: 'Int64', 2: 'Int32'
            });
          });
        });
      });
      describe('from end of array', () => {
        describe('last column is now empty', () => {
          before((done) => {
            store = configureStore({ actions: actions });
            store.resetColumns(arrayCols);
            expect(store.columns).to.deep.equal(arrayCols);
            expect(store.showing).to.deep.equal(arrayShowing);
            done();
          });
          after((done) => {
            done();
          });
          it('does trigger with remove', (done) => {
            const unsubscribe = store.listen((params) => {
              unsubscribe();
              expect(params).to.deep.equal({
                refresh: {oid: 'id1'},
                remove: {colIds: [2]}
              });
              done();
            });
            store.elementRemoved(2, 'id1', true);
          });
          it('updates this.columns correctly', () => {
            expect(store.columns).to.deep.equal({
              0: {id1: 'String', id2: 'Int64'},
              1: {id1: 'Int64', id2: 'Double'}
            });
          });
          it('updates this.showing correctly', () => {
            expect(store.showing).to.deep.equal({
              0: 'Mixed', 1: 'Mixed'
            });
          });
        });
        describe('last column is not empty', () => {
          before((done) => {
            store = configureStore({ actions: actions });
            store.resetColumns(arrayCols);
            expect(store.columns).to.deep.equal(arrayCols);
            expect(store.showing).to.deep.equal(arrayShowing);
            done();
          });
          after((done) => {
            done();
          });
          it('does not trigger with remove', (done) => {
            const unsubscribe = store.listen((params) => {
              unsubscribe();
              expect(params).to.deep.equal({
                updateHeaders: {showing: {1: 'Int64', 2: 'Int32'} },
                refresh: {oid: 'id2'}
              });
              done();
            });
            store.elementRemoved(1, 'id2', true);
          });
          it('updates this.columns correctly', () => {
            expect(store.columns).to.deep.equal({
              0: {id1: 'String', id2: 'Int64'},
              1: {id1: 'Int64'},
              2: {id1: 'Int32'}
            });
          });
          it('updates this.showing correctly', () => {
            expect(store.showing).to.deep.equal({
              0: 'Mixed', 1: 'Int64', 2: 'Int32'
            });
          });
        });
      });
    });
    describe('with staged elements', () => {
      describe('element being removed was staged', () => {
        before((done) => {
          store = configureStore({ actions: actions });
          store.resetColumns(arrayCols);
          store.elementMarkRemoved(1, 'id1');
          expect(store.columns).to.deep.equal({
            0: {id1: 'String', id2: 'Int64'},
            1: {id2: 'Double'},
            2: {id1: 'Int32' }
          });
          expect(store.showing).to.deep.equal({
            0: 'Mixed', 1: 'Double', 2: 'Int32'
          });
          expect(store.stageRemove).to.deep.equal({
            1: {id1: true}
          });
          done();
        });
        after((done) => {
          done();
        });
        it('does trigger with remove', (done) => {
          const unsubscribe = store.listen((params) => {
            unsubscribe();
            expect(params).to.deep.equal({
              updateHeaders: {showing: {
                1: 'Mixed'
              }},
              refresh: {oid: 'id1'},
              remove: {colIds: [2]}
            });
            done();
          });
          store.elementRemoved(1, 'id1', true);
        });
        it('updates this.columns correctly', () => {
          expect(store.columns).to.deep.equal({
            0: {id1: 'String', id2: 'Int64'},
            1: {id1: 'Int32', id2: 'Double'}
          });
        });
        it('updates this.showing correctly', () => {
          expect(store.showing).to.deep.equal({
            0: 'Mixed', 1: 'Mixed'
          });
        });
        it('updates this.stageRemoved correctly', () => {
          expect(store.stageRemove).to.deep.equal({});
        });
      });
      describe('element being removed was not staged', () => {
        describe('element marked as removed is after element removed', () => {
          before((done) => {
            store = configureStore({ actions: actions });
            store.resetColumns(arrayCols);
            store.elementMarkRemoved(2, 'id1');
            expect(store.columns).to.deep.equal({
              0: {id1: 'String', id2: 'Int64'},
              1: {id1: 'Int64', id2: 'Double'}
            });
            expect(store.showing).to.deep.equal({
              0: 'Mixed', 1: 'Mixed', 2: 'Int32'
            });
            expect(store.stageRemove).to.deep.equal({
              2: {id1: true}
            });
            done();
          });
          after((done) => {
            done();
          });
          it('does trigger with remove', (done) => {
            const unsubscribe = store.listen((params) => {
              unsubscribe();
              expect(params).to.deep.equal({
                updateHeaders: {showing: {
                  1: 'Double'
                }},
                refresh: {oid: 'id1'},
                remove: {colIds: [2]}
              });
              done();
            });
            store.elementRemoved(1, 'id1', true);
          });
          it('updates this.columns correctly', () => {
            expect(store.columns).to.deep.equal({
              0: {id1: 'String', id2: 'Int64'},
              1: {id2: 'Double'}
            });
          });
          it('updates this.showing correctly', () => {
            expect(store.showing).to.deep.equal({
              0: 'Mixed', 1: 'Double'
            });
          });
          it('updates this.stageRemoved correctly', () => {
            expect(store.stageRemove).to.deep.equal({
              1: {id1: true}
            });
          });
        });
      });
    });
  });

  describe('#elementTypeChanged', () => {
    before((done) => {
      store = configureStore({ actions: actions });
      store.resetColumns({field1: {3: 'Object'}});
      done();
    });
    describe('Changing the type of the last item', () => {
      it('triggers correctly', (done) => {
        const unsubscribe = store.listen((params) => {
          unsubscribe();
          expect(params).to.deep.equal({updateHeaders: {showing: {field1: 'Date'}}});
          done();
        });
        store.elementTypeChanged('field1', 'Date', '3');
      });
      it('sets this.columns correctly', () => {
        expect(store.columns).to.deep.equal({field1: {3: 'Date'}});
      });
      it('sets this.showing correctly', () => {
        expect(store.showing).to.deep.equal({field1: 'Date'});
      });
    });
    describe('Casted to the same type', () => {
      it('does not trigger', () => {
        const unsubscribe = store.listen(() => {
          assert.fail();
        });
        store.elementTypeChanged('field1', 'Date', '3');
        unsubscribe();
      });
      it('sets this.columns correctly', () => {
        expect(store.columns).to.deep.equal({field1: {3: 'Date'}});
      });
      it('sets this.showing correctly', () => {
        expect(store.showing).to.deep.equal({field1: 'Date'});
      });
    });
    describe('Changing the type to Mixed', () => {
      before((done) => {
        store = configureStore({ actions: actions });
        store.resetColumns({field1: {3: 'Date', 2: 'Date'}});
        done();
      });
      it('triggers correctly', (done) => {
        const unsubscribe = store.listen((params) => {
          unsubscribe();
          expect(params).to.deep.equal({updateHeaders: {showing: {field1: 'Mixed'}}});
          done();
        });
        store.elementTypeChanged('field1', 'Double', '3');
      });
      it('sets this.columns correctly', () => {
        expect(store.columns).to.deep.equal({field1: {3: 'Double', 2: 'Date'}});
      });
      it('sets this.showing correctly', () => {
        expect(store.showing).to.deep.equal({field1: 'Mixed'});
      });
    });
    describe('Changing the type from Mixed', () => {
      it('triggers correctly', (done) => {
        const unsubscribe = store.listen((params) => {
          unsubscribe();
          expect(params).to.deep.equal({updateHeaders: {showing: {field1: 'Double'}}});
          done();
        });
        store.elementTypeChanged('field1', 'Double', '2');
      });
      it('sets this.columns correctly', () => {
        expect(store.columns).to.deep.equal({field1: {3: 'Double', 2: 'Double'}});
      });
      it('sets this.showing correctly', () => {
        expect(store.showing).to.deep.equal({field1: 'Double'});
      });
    });
  });

  describe('#elementMarkRemoved', () => {
    before((done) => {
      store = configureStore({ actions: actions });
      store.resetColumns(columns);
      showing.field1 = 'Object';
      showing.field5 = 'Mixed';
      expect(store.columns).to.deep.equal(columns);
      expect(store.showing).to.deep.equal(showing);
      expect(store.stageRemove).to.deep.equal({});
      done();
    });
    describe('marking an element as removed with the same type', () => {
      it('does not trigger', () => {
        const unsubscribe = store.listen(() => {
          assert.fail();
        });
        store.elementMarkRemoved('field1', '1');
        store.elementMarkRemoved('field1', '2');
        store.elementMarkRemoved('field1', '3');
        unsubscribe();
      });
      it('sets this.columns correctly', () => {
        expect(store.columns).to.deep.equal({
          field2: {1: 'Array', 2: 'Array', 3: 'Array'},
          field3: {1: 'Int32', 2: 'Int32', 3: 'Int32'},
          field4: {1: 'Binary', 2: 'Binary', 3: 'Binary'},
          field5: {1: 'Int32', 2: 'Int32', 3: 'String'}
        });
      });
      it('sets this.showing correctly', () => {
        expect(store.showing).to.deep.equal(showing);
      });
      it('sets this.stageRemove correctly', () => {
        expect(store.stageRemove).to.deep.equal({field1: {1: true, 2: true, 3: true}});
      });
    });
    describe('marking an element as removed with a different type but still Mixed', () => {
      it('does not trigger', () => {
        const unsubscribe = store.listen(() => {
          assert.fail();
        });
        store.elementMarkRemoved('field5', '1');
        unsubscribe();
      });
      it('sets this.columns correctly', () => {
        expect(store.columns).to.deep.equal({
          field2: {1: 'Array', 2: 'Array', 3: 'Array'},
          field3: {1: 'Int32', 2: 'Int32', 3: 'Int32'},
          field4: {1: 'Binary', 2: 'Binary', 3: 'Binary'},
          field5: {2: 'Int32', 3: 'String'}
        });
      });
      it('sets this.showing correctly', () => {
        expect(store.showing).to.deep.equal(showing);
      });
      it('sets this.stageRemove correctly', () => {
        expect(store.stageRemove).to.deep.equal({field1: {1: true, 2: true, 3: true}, field5: {1: true}});
      });
    });
    describe('marking an element as removed with a different type no longer Mixed', () => {
      it('triggers correctly', (done) => {
        const unsubscribe = store.listen((params) => {
          unsubscribe();
          expect(params).to.deep.equal({updateHeaders: {showing: {field5: 'Int32'}}});
          done();
        });
        store.elementMarkRemoved('field5', '3');
      });
      it('sets this.columns correctly', () => {
        expect(store.columns).to.deep.equal({
          field2: {1: 'Array', 2: 'Array', 3: 'Array'},
          field3: {1: 'Int32', 2: 'Int32', 3: 'Int32'},
          field4: {1: 'Binary', 2: 'Binary', 3: 'Binary'},
          field5: {2: 'Int32'}
        });
      });
      it('sets this.showing correctly', () => {
        showing.field5 = 'Int32';
        expect(store.showing).to.deep.equal(showing);
      });
      it('sets this.stageRemove correctly', () => {
        expect(store.stageRemove).to.deep.equal({field1: {1: true, 2: true, 3: true}, field5: {1: true, 3: true}});
      });
    });
    describe('marking the last element in a column as removed', () => {
      it('does not trigger', () => {
        const unsubscribe = store.listen(() => {
          assert.fail();
        });
        store.elementMarkRemoved('field5', '2');
        unsubscribe();
      });
      it('sets this.columns correctly', () => {
        expect(store.columns).to.deep.equal({
          field2: {1: 'Array', 2: 'Array', 3: 'Array'},
          field3: {1: 'Int32', 2: 'Int32', 3: 'Int32'},
          field4: {1: 'Binary', 2: 'Binary', 3: 'Binary'}
        });
      });
      it('sets this.showing correctly', () => {
        expect(store.showing).to.deep.equal(showing);
      });
      it('sets this.stageRemove correctly', () => {
        expect(store.stageRemove).to.deep.equal({field1: {1: true, 2: true, 3: true}, field5: {1: true, 2: true, 3: true}});
      });
    });
    describe('calling elementAdded for a marked removed element adds it back', () => {
      it('triggers correctly', (done) => {
        const unsubscribe = store.listen((params) => {
          unsubscribe();
          expect(params).to.deep.equal({updateHeaders: {showing: {field1: 'String'}}});
          done();
        });
        store.elementAdded('field1', 'String', '1');
      });
      it('sets this.columns correctly', () => {
        expect(store.columns).to.deep.equal({
          field1: {1: 'String'},
          field2: {1: 'Array', 2: 'Array', 3: 'Array'},
          field3: {1: 'Int32', 2: 'Int32', 3: 'Int32'},
          field4: {1: 'Binary', 2: 'Binary', 3: 'Binary'}
        });
      });
      it('sets this.showing correctly', () => {
        showing.field1 = 'String';
        expect(store.showing).to.deep.equal(showing);
      });
      it('sets this.stageRemove correctly', () => {
        expect(store.stageRemove).to.deep.equal({field1: {2: true, 3: true}, field5: {1: true, 2: true, 3: true}});
      });
    });
    describe('calling elementRemoved for a marked remove element removes it', () => {
      it('does not trigger if there are marked removed elements in the column', () => {
        const unsubscribe = store.listen(() => {
          assert.fail();
        });
        store.elementRemoved('field1', '1');
        store.elementRemoved('field1', '2');
        unsubscribe();
      });
      it('sets this.columns correctly', () => {
        expect(store.columns).to.deep.equal({
          field2: {1: 'Array', 2: 'Array', 3: 'Array'},
          field3: {1: 'Int32', 2: 'Int32', 3: 'Int32'},
          field4: {1: 'Binary', 2: 'Binary', 3: 'Binary'}
        });
      });
      it('sets this.showing correctly', () => {
        showing.field5 = 'Int32';
        expect(store.showing).to.deep.equal(showing);
      });
      it('sets this.stageRemove correctly', () => {
        expect(store.stageRemove).to.deep.equal({field1: {3: true}, field5: {1: true, 2: true, 3: true}});
      });
      it('triggers if there are no  more marked removed elements in the column', (done) => {
        const unsubscribe = store.listen((params) => {
          unsubscribe();
          expect(params).to.deep.equal({remove: {colIds: ['field1']}});
          done();
        });
        store.elementRemoved('field1', '3');
      });
      it('sets this.columns correctly', () => {
        expect(store.columns).to.deep.equal({
          field2: {1: 'Array', 2: 'Array', 3: 'Array'},
          field3: {1: 'Int32', 2: 'Int32', 3: 'Int32'},
          field4: {1: 'Binary', 2: 'Binary', 3: 'Binary'}
        });
      });
      it('sets this.showing correctly', () => {
        delete showing.field1;
        expect(store.showing).to.deep.equal(showing);
      });
      it('sets this.stageRemove correctly', () => {
        expect(store.stageRemove).to.deep.equal({field5: {1: true, 2: true, 3: true}});
      });
    });
  });

  describe('#cleanCols', () => {
    describe('columns have elements marked for deletion', () => {
      before((done) => {
        store = configureStore({ actions: actions });
        store.resetColumns({field1: {1: 'Object', 2: 'Object', 3: 'Object'}});
        store.elementMarkRemoved('field1', 1);
        store.elementMarkRemoved('field1', 2);
        store.elementMarkRemoved('field1', 3);
        expect(store.columns).to.deep.equal({});
        expect(store.showing).to.deep.equal({field1: 'Object'});
        expect(store.stageRemove).to.deep.equal({field1: {1: true, 2: true, 3: true}});
        done();
      });
      it('does not trigger', () => {
        const unsubscribe = store.listen(() => {
          assert.fail();
        });
        store.cleanCols();
        unsubscribe();
      });
      it('does not make internal changes', () => {
        expect(store.columns).to.deep.equal({});
        expect(store.showing).to.deep.equal({field1: 'Object'});
        expect(store.stageRemove).to.deep.equal({field1: {1: true, 2: true, 3: true}});
      });
    });
    describe('all elements in column are removed', () => {
      before((done) => {
        store = configureStore({ actions: actions });
        store.resetColumns({field1: {3: 'Object'}, field2: {3: 'Array'}});
        delete store.columns.field1;
        delete store.columns.field2;
        expect(store.columns).to.deep.equal({});
        expect(store.showing).to.deep.equal({field1: 'Object', field2: 'Array'});
        expect(store.stageRemove).to.deep.equal({});
        done();
      });
      it('triggers correctly', (done) => {
        const unsubscribe = store.listen((params) => {
          unsubscribe();
          expect(params).to.deep.equal({remove: {colIds: ['field1', 'field2']}});
          done();
        });
        store.cleanCols();
      });
      it('makes internal changes', () => {
        expect(store.columns).to.deep.equal({});
        expect(store.showing).to.deep.equal({});
        expect(store.stageRemove).to.deep.equal({});
      });
    });
  });

  describe('#renameColumn', () => {
    before((done) => {
      store = configureStore({ actions: actions });
      store.resetColumns({$new: {id1: 'Int32', id2: 'String'}});
      store.elementMarkRemoved('$new', 'id2');
      done();
    });
    after((done) => {
      done();
    });
    it('updates objects', () => {
      store.renameColumn('$new', 'fieldname');
      expect(store.columns).to.deep.equal({fieldname: {id1: 'Int32'}});
      expect(store.showing).to.deep.equal({fieldname: 'Int32'});
      expect(store.stageRemove).to.deep.equal({fieldname: {id2: true}});
    });
  });

  describe('#replaceDoc', () => {
    describe('replacing a document with a smaller document', () => {
      before((done) => {
        store = configureStore({ actions: actions });
        store.resetColumns({
          0: {id1: 'String', id2: 'Int32'},
          1: {id1: 'Int64', id2: 'Double'},
          2: {id1: 'Int32' }
        });
        store.elementMarkRemoved(0, 'id1');
        done();
      });
      after((done) => {
        done();
      });
      it('triggers correctly', (done) => {
        const unsubscribe = store.listen((params) => {
          unsubscribe();
          expect(params).to.deep.equal({
            updateHeaders: {showing: {
              0: 'Int32', 1: 'Mixed', 2: 'Int32'}
            },
            refresh: {oid: 'id1'}
          });
          done();
        });
        store.replaceDoc(
          'id1', 'id1', {0: 1, 1: 'a string'}
        );
      });
      it('updates columns correctly', () => {
        expect(store.columns).to.deep.equal({
          0: {id1: 'Int32', id2: 'Int32'},
          1: {id1: 'String', id2: 'Double'}
        });
      });
      it('updates showing correctly', () => {
        expect(store.showing).to.deep.equal({
          0: 'Int32',
          1: 'Mixed',
          2: 'Int32'
        });
      });
      it('updates stageRemove correctly', () => {
        expect(store.stageRemove).to.deep.equal({});
      });
    });
    describe('replacing a document with a larger document', () => {
      before((done) => {
        store = configureStore({ actions: actions });
        store.resetColumns({
          0: {id1: 'String', id2: 'Int32'},
          1: {id1: 'Int64', id2: 'Double'},
          2: {id1: 'Int32' }
        });
        store.elementMarkRemoved(1, 'id2');
        done();
      });
      after((done) => {
        done();
      });
      it('triggers correctly', (done) => {
        const unsubscribe = store.listen((params) => {
          unsubscribe();
          expect(params).to.deep.equal({
            updateHeaders: {showing: {
              0: 'Int32', 1: 'String', 2: 'String', 3: 'Int32', 4: 'String'}
            },
            refresh: {oid: 'id1'}
          });
          done();
        });
        store.replaceDoc(
          'id1', 'id1', {
            0: 1, 1: 'a string', 2: 'another string', 3: 1, 4: 'last string'
          }
        );
      });
      it('updates columns correctly', () => {
        expect(store.columns).to.deep.equal({
          0: {id1: 'Int32', id2: 'Int32'},
          1: {id1: 'String'},
          2: {id1: 'String'},
          3: {id1: 'Int32'},
          4: {id1: 'String'}
        });
      });
      it('updates showing correctly', () => {
        expect(store.showing).to.deep.equal({
          0: 'Int32',
          1: 'String',
          2: 'String',
          3: 'Int32',
          4: 'String'
        });
      });
      it('updates stageRemove correctly', () => {
        expect(store.stageRemove).to.deep.equal({1: {id2: true}});
      });
    });
  });
});
