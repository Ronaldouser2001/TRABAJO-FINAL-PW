import { provideRouter } from "@angular/router";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Pie } from "./pie";

describe("Pie", () => {
  let component: Pie;
  let fixture: ComponentFixture<Pie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [Pie],
    }).compileComponents();

    fixture = TestBed.createComponent(Pie);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
