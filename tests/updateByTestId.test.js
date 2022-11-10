
beforeAll(()=>{
    console.log('Before All')
})

afterAll(()=>{
    console.log('After All')
   
})

beforeEach(function(){
    console.log('Before each****') 
    console.log(this)
})

afterEach(()=>{
    console.log('******After each****') 
})
test('should first', () => { console.log('Test success') })
test('should second', () => { console.log('Test success') })