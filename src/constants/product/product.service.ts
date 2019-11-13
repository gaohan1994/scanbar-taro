/**
 * @Author: Ghan 
 * @Date: 2019-11-13 10:16:32 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-13 10:18:27
 */
import requestHttp from "../../common/request/request.http";
import { ProductInterface } from "./product";
import ProductInterfaceMap from './product';
import { HTTPInterface } from "..";

class ProductService {

  public productInfoGetList = async (params?: ProductInterface.ProductInfoGetListFetchFidle): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(ProductInterfaceMap.productInfoGetList(params));
  }
}

export default new ProductService();