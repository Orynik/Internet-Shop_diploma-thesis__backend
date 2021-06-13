const chai = require('chai');
const chaiHttp =  require('chai-http');
const app = require('../index.js');

var objectTest = {
  "Serial": {
    "Add": "TestSerial",
    "Id" : 0
  }
}

chai.use(chaiHttp);
chai.should();

describe("Serial Endpoint",() => {
  describe("Get /Serial (All Serial)", () =>{
    it("Should get all Serial fields",(done) => {
      chai.request(app)
        .get("/serials")
        .end((err,res) =>{
          res.should.have.status(200);
          res.body.should.be.a('object');
          objectTest.Serial.Id = res.body.Id;
          done()
        })
    })
  })
  describe("Post /Serial", () =>{
    it("Should get 201 status code", (done)=>{
      chai.request(app)
        .post("/serials")
        .send(
          {
            "Serial": objectTest.Serial.Add
          }
        )
        .end((err,res) =>{
          res.should.have.status(201);
          done();
        })
    })
  })
  describe("Delete /Serial", () =>{
    it("Should get 201 status code", (done)=>{
      chai.request(app)
        .delete("/serials?id=1")
        .end((err,res) =>{
          res.should.have.status(204);
          done();
        })
    })
    it("Should get 500 status code", (done)=>{
      chai.request(app)
        .delete("/serials?id=d")
        .end((err,res) =>{
          res.should.have.status(500);
          res.body.should.be.a("object")
          done();
        })
    })
  })
})

