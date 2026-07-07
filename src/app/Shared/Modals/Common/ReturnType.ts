import { Observable } from "rxjs"

export interface ReturnType<T> {
    ReturnVal: T,
    ReturnStatus: any,
    ReturnList: Observable<T>,
    ReturnMessage: string,
    PaginationCount: number,
    TotalCount: number
}