import { RifigiCaiPage } from './app.po';

describe('Rifugi CAI App', () => {
  let page: RifigiCaiPage;

  beforeEach(() => {
    page = new RifigiCaiPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
