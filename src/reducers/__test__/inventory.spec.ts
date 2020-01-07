require('@babel/polyfill');
import inventoryReducer, { initState } from '../app.inventory';
import { InventoryInterfaceMap } from '../../constants';

describe('inventory reducer Test', () => {
  it('Undefined Reducer', () => {
    const reducer: any = {
      type: '',
      payload: {}
    };

    expect(inventoryReducer(initState, reducer)).toEqual(initState);
  });

  it('receive stock detail', () => {
    const stockDetail = {
      id: 1,
      productList: [],
      businessNumber: 2,
    };
    const reducer = {
      type: InventoryInterfaceMap.reducerInterface.RECEIVE_PURCHASE_STOCK_DETAIL,
      payload: {
        data: stockDetail as any
      }
    };
    expect(inventoryReducer(initState, reducer)).toEqual({
      ...initState,
      stockDetail
    });
  });
});