import { provideRouter } from "@angular/router";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Cabecera } from "./cabecera";

describe("Cabecera", () => {
  let component: Cabecera;
  let fixture: ComponentFixture<Cabecera>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [Cabecera],
    }).compileComponents();

    fixture = TestBed.createComponent(Cabecera);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
