import { DialogEditProductComponent } from './dialog-edit-product/dialog-edit-product.component';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ProductsService } from './products.service';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from './product.model';
import { map } from 'rxjs/operators'
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  simplesReqProductsObs$!: Observable<Product[]>
  productsErrorHandling!: Product[]
  productsLoading!: Product[]
  bLoading: boolean = false
  productsIds!: Product[]
  newlyProducts: Product[] = []
  productsToDelete!: Product[]
  productsToEdit!: Product[]

  constructor(
    private productsService: ProductsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
    ) { }

  ngOnInit() {

  }

  getSimpleHttpRequest() {
    this.simplesReqProductsObs$ = this.productsService.getProducts()
  }

  getProductsWithErrorHandling() {
    this.productsService.getProductsError().subscribe((prods) => {
      this.productsErrorHandling = prods
    }, (err) => {
      console.log(err)
      console.log("Message: " + err.error.msg)
      console.log("Status code: " + err.status)
      let config = new MatSnackBarConfig()
      config.duration = 2000
      config.panelClass = ['snack_error']
      if (err.status == 0)
        this.snackBar.open('Could not connect to the server', '', config)
      else
        this.snackBar.open(err.error.msg, '', config)
    })
  }

  getProductsWithErrorHandlingOk() {
    this.productsService.getProductsDelay().subscribe((prods) => {
      this.productsErrorHandling = prods
      let config = new MatSnackBarConfig()
      config.duration = 2000
      config.panelClass = ['snack_ok']
        this.snackBar.open('Product successfuly loaded!', '', config)

    }, (err) => {
      console.log(err)
      console.log("Message: " + err.error.msg)
    })
  }

  getProductsLoading() {
    this.bLoading = true
    this.productsService.getProductsDelay().subscribe((prods) => {
      this.productsLoading = prods
      this.bLoading = false
    }, (err) => {
      console.log(err)
      console.log("Message: " + err.error.msg)
      this.bLoading = false
    })
  }

  loadName(id: string) {
    this.productsService.getProductName(id).subscribe((name => {
      let index = this.productsIds.findIndex(p => p._id === id)
      if (index >= 0) {
        this.productsIds[index].name = name
      }
    }))
  }

  getProductsIds() {
    this.productsService.getProductsIds().subscribe((ids) => {
      this.productsIds = ids.map(id => ({_id: id, name: '', department: '', price: 0}))
    })
  }

  saveProduct(_id: string, name: string, department: string, price: number | string) {
    let p = {_id, name, department, price}
    this.productsService.saveProducts(p).subscribe(
      (p: Product) => {
        console.log(p)
        this.newlyProducts.push(p)
      },
      (err) => {
        console.log(err)
        let config = new MatSnackBarConfig()
        config.duration = 2000
        config.panelClass = ['snack_error']
        if (err.status == 0)
          this.snackBar.open('Could not connect to the server', '', config)
        else
          this.snackBar.open(err.error.msg, '', config)
      }
    )
  }

  loadProductsToDelete() {
    this.productsService.getProducts().subscribe((prods) => this.productsToDelete = prods)
  }

  deleteProduct(p: Product) {
    this.productsService.deleteProduct(p).subscribe((res) => {
      let i = this.productsToDelete.findIndex(prod => p._id == prod._id)
      if (i>=0)
        this.productsToDelete.splice(i, 1)
    }, (err) => {
      console.log(err)
    })
  }

  loadProductsToEdit() {
    this.productsService.getProducts().subscribe((prods) => this.productsToEdit = prods)
  }

  editProduct(p: Product) {
    let newProduct: Product = {...p}
    let dialogRef = this.dialog.open(DialogEditProductComponent, {width: '400px', data: newProduct})
    dialogRef.afterClosed().subscribe((res: Product) => {
      //console.log(res)
      if (res) {
        this.productsService.editProduct(res)
          .subscribe(
            (resp) => {
              let i = this.productsToEdit.findIndex(prod => p._id == prod._id)
              if (i >= 0)
                this.productsToEdit[i] = resp
            },
            (err) => console.error(err)
          )
      }
    })
  }
}
