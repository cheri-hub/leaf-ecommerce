using EcommerceApi.Models.DTOs;
using FluentValidation.TestHelper;
using EcommerceApi.Validators;

namespace EcommerceApi.Tests.Unit.Validators;

public class CreateProductValidatorTests
{
    private readonly CreateProductValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var request = new CreateProductRequest(
            "Camiseta Leaf", "Camiseta verde ecológica", 5990, 100, Guid.NewGuid(), null);

        var result = _validator.TestValidate(request);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Fail_When_Name_Is_Empty()
    {
        var request = new CreateProductRequest(
            "", null, 5990, 100, Guid.NewGuid(), null);

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_Fail_When_Price_Is_Zero()
    {
        var request = new CreateProductRequest(
            "Produto", null, 0, 10, Guid.NewGuid(), null);

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.PriceInCents);
    }

    [Fact]
    public void Should_Fail_When_Price_Is_Negative()
    {
        var request = new CreateProductRequest(
            "Produto", null, -100, 10, Guid.NewGuid(), null);

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.PriceInCents);
    }

    [Fact]
    public void Should_Fail_When_Stock_Is_Negative()
    {
        var request = new CreateProductRequest(
            "Produto", null, 1000, -1, Guid.NewGuid(), null);

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.Stock);
    }

    [Fact]
    public void Should_Fail_When_CategoryId_Is_Empty()
    {
        var request = new CreateProductRequest(
            "Produto", null, 1000, 10, Guid.Empty, null);

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.CategoryId);
    }

    [Fact]
    public void Should_Fail_When_Name_Exceeds_MaxLength()
    {
        var request = new CreateProductRequest(
            new string('A', 301), null, 1000, 10, Guid.NewGuid(), null);

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.Name);
    }
}

public class UpdateProductValidatorTests
{
    private readonly UpdateProductValidator _validator = new();

    [Fact]
    public void Should_Pass_When_All_Null()
    {
        var request = new UpdateProductRequest(null, null, null, null, null, null);

        var result = _validator.TestValidate(request);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Fail_When_Price_Is_Zero()
    {
        var request = new UpdateProductRequest(null, null, 0, null, null, null);

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.PriceInCents);
    }

    [Fact]
    public void Should_Fail_When_Stock_Is_Negative()
    {
        var request = new UpdateProductRequest(null, null, null, -5, null, null);

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.Stock);
    }

    [Fact]
    public void Should_Pass_When_Name_Is_Valid()
    {
        var request = new UpdateProductRequest("Novo Nome", null, null, null, null, null);

        var result = _validator.TestValidate(request);

        result.ShouldNotHaveAnyValidationErrors();
    }
}

public class CreateCategoryValidatorTests
{
    private readonly CreateCategoryValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var request = new CreateCategoryRequest("Roupas", "Categoria de roupas");

        var result = _validator.TestValidate(request);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Fail_When_Name_Is_Empty()
    {
        var request = new CreateCategoryRequest("", null);

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_Fail_When_Name_Exceeds_MaxLength()
    {
        var request = new CreateCategoryRequest(new string('A', 201), null);

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.Name);
    }
}

public class CreateOrderValidatorTests
{
    private readonly CreateOrderValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var request = new CreateOrderRequest(
            [new CreateOrderItemRequest(Guid.NewGuid(), 2)],
            new CustomerDataRequest("João Silva", "joao@email.com", "11999999999", "12345678901"));

        var result = _validator.TestValidate(request);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Fail_When_Items_Is_Empty()
    {
        var request = new CreateOrderRequest(
            [],
            new CustomerDataRequest("João Silva", "joao@email.com", null, null));

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.Items);
    }

    [Fact]
    public void Should_Fail_When_Quantity_Is_Zero()
    {
        var request = new CreateOrderRequest(
            [new CreateOrderItemRequest(Guid.NewGuid(), 0)],
            new CustomerDataRequest("João Silva", "joao@email.com", null, null));

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor("Items[0].Quantity");
    }

    [Fact]
    public void Should_Fail_When_Customer_Email_Is_Invalid()
    {
        var request = new CreateOrderRequest(
            [new CreateOrderItemRequest(Guid.NewGuid(), 1)],
            new CustomerDataRequest("João Silva", "invalid-email", null, null));

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor("Customer.Email");
    }

    [Fact]
    public void Should_Fail_When_Customer_Name_Is_Empty()
    {
        var request = new CreateOrderRequest(
            [new CreateOrderItemRequest(Guid.NewGuid(), 1)],
            new CustomerDataRequest("", "joao@email.com", null, null));

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor("Customer.Name");
    }
}

public class RegisterValidatorTests
{
    private readonly RegisterValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var request = new RegisterRequest("João Silva", "joao@email.com", "Senha1234", "11999999999", null);

        var result = _validator.TestValidate(request);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Fail_When_Email_Is_Invalid()
    {
        var request = new RegisterRequest("João Silva", "invalid", "Senha1234", null, null);

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_Fail_When_Password_Is_Too_Short()
    {
        var request = new RegisterRequest("João Silva", "joao@email.com", "123", null, null);

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.Password);
    }

    [Fact]
    public void Should_Fail_When_FullName_Is_Empty()
    {
        var request = new RegisterRequest("", "joao@email.com", "Senha1234", null, null);

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.FullName);
    }
}

public class LoginValidatorTests
{
    private readonly LoginValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Valid()
    {
        var request = new LoginRequest("joao@email.com", "Senha1234");

        var result = _validator.TestValidate(request);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Should_Fail_When_Email_Is_Empty()
    {
        var request = new LoginRequest("", "Senha1234");

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Should_Fail_When_Password_Is_Empty()
    {
        var request = new LoginRequest("joao@email.com", "");

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.Password);
    }
}
