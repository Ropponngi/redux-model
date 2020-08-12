import { Model } from '../../src/models/Model';
import { $api } from '../libs/ApiService';
import { basicModel } from './BasicModel';

interface Response {
  id: number;
}

type Data = Response;

export class ComposeModel extends Model<Data> {
  manage = this.compose(async () => {
    await $api.postAsync({
      uri: '/',
      body: {},
    });

    const { response } = await basicModel.getProfile();

    this.changeState((state) => {
      state.id = response.id;
    });
  });

  protected initialState(): Data {
    return {
      id: 0,
    };
  }
}

export const composeModel = new ComposeModel();
