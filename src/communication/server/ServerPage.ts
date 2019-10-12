import { Page, ValidationError } from '@jsfsi-core/typescript-cross-platform'

export class ServerPage<T> implements Page<T> {
    pages: number
    nextPage: number
    totalElements: number
    currentPage: number
    pageSize: number
    elements: Array<T>

    constructor(totalElements: number, currentPage: number, pageSize: number, elements: Array<T>) {
        this.totalElements = totalElements > 0 ? totalElements : 0

        if (pageSize <= 0) {
            throw new ValidationError(`Page size ${pageSize} must be a positive number higher than 0`)
        }

        this.pageSize = pageSize
        this.elements = elements

        if (currentPage <= 0) {
            throw new ValidationError(`Current page ${currentPage} must be a positive number higher than 0`)
        }

        this.currentPage = currentPage

        this.pages = Math.ceil(this.totalElements / this.pageSize)

        this.nextPage = this.pages === this.currentPage ? this.currentPage : this.currentPage + 1
    }
}
