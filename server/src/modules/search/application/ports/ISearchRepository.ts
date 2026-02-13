import { Ad } from '../../../ads/domain/entities/Ad';
import { SearchQuery } from '../../domain/value-objects/SearchQuery';

export interface ISearchRepository {
    search(query: SearchQuery): Promise<Ad[]>;
    count(query: SearchQuery): Promise<number>;
}
