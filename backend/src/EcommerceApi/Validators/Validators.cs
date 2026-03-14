using EcommerceApi.Models.DTOs;
using FluentValidation;

namespace EcommerceApi.Validators;

public class CreateProductValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome é obrigatório")
            .MaximumLength(300).WithMessage("Nome deve ter no máximo 300 caracteres");

        RuleFor(x => x.PriceInCents)
            .GreaterThan(0).WithMessage("Preço deve ser maior que zero");

        RuleFor(x => x.Stock)
            .GreaterThanOrEqualTo(0).WithMessage("Estoque não pode ser negativo");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Categoria é obrigatória");

        RuleForEach(x => x.Images).ChildRules(img =>
        {
            img.RuleFor(i => i.Url)
                .NotEmpty().WithMessage("URL da imagem é obrigatória")
                .MaximumLength(2048);
        });
    }
}

public class UpdateProductValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Name)
            .MaximumLength(300).WithMessage("Nome deve ter no máximo 300 caracteres")
            .When(x => x.Name is not null);

        RuleFor(x => x.PriceInCents)
            .GreaterThan(0).WithMessage("Preço deve ser maior que zero")
            .When(x => x.PriceInCents.HasValue);

        RuleFor(x => x.Stock)
            .GreaterThanOrEqualTo(0).WithMessage("Estoque não pode ser negativo")
            .When(x => x.Stock.HasValue);
    }
}

public class CreateCategoryValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Nome é obrigatório")
            .MaximumLength(200).WithMessage("Nome deve ter no máximo 200 caracteres");
    }
}

public class CreateOrderValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Pedido deve ter pelo menos um item");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).NotEmpty().WithMessage("ID do produto é obrigatório");
            item.RuleFor(i => i.Quantity).GreaterThan(0).WithMessage("Quantidade deve ser maior que zero");
        });

        RuleFor(x => x.Customer).NotNull().WithMessage("Dados do cliente são obrigatórios");
        RuleFor(x => x.Customer.Name).NotEmpty().WithMessage("Nome do cliente é obrigatório");
        RuleFor(x => x.Customer.Email)
            .NotEmpty().WithMessage("E-mail do cliente é obrigatório")
            .EmailAddress().WithMessage("E-mail inválido");
        RuleFor(x => x.Customer.TaxId)
            .NotEmpty().WithMessage("CPF/CNPJ é obrigatório")
            .Must(taxId =>
            {
                var digits = new string(taxId?.Where(char.IsDigit).ToArray() ?? []);
                return digits.Length is 11 or 14;
            }).WithMessage("CPF deve ter 11 dígitos ou CNPJ 14 dígitos");
    }
}

public class RegisterValidator : AbstractValidator<RegisterRequest>
{
    public RegisterValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Nome completo é obrigatório")
            .MaximumLength(300);

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-mail é obrigatório")
            .EmailAddress().WithMessage("E-mail inválido");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Senha é obrigatória")
            .MinimumLength(8).WithMessage("Senha deve ter pelo menos 8 caracteres");
    }
}

public class LoginValidator : AbstractValidator<LoginRequest>
{
    public LoginValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-mail é obrigatório")
            .EmailAddress().WithMessage("E-mail inválido");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Senha é obrigatória");
    }
}

public class UpdateProfileValidator : AbstractValidator<UpdateProfileRequest>
{
    public UpdateProfileValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Nome completo é obrigatório")
            .MaximumLength(300).WithMessage("Nome deve ter no máximo 300 caracteres");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("E-mail inválido")
            .When(x => !string.IsNullOrEmpty(x.Email));

        RuleFor(x => x.Phone)
            .MaximumLength(20).WithMessage("Telefone deve ter no máximo 20 caracteres")
            .When(x => !string.IsNullOrEmpty(x.Phone));
    }
}

public class ChangePasswordValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("Senha atual é obrigatória");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Nova senha é obrigatória")
            .MinimumLength(8).WithMessage("Nova senha deve ter pelo menos 8 caracteres");
    }
}

public class ForgotPasswordValidator : AbstractValidator<ForgotPasswordRequest>
{
    public ForgotPasswordValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-mail é obrigatório")
            .EmailAddress().WithMessage("E-mail inválido");
    }
}

public class ResetPasswordValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-mail é obrigatório")
            .EmailAddress().WithMessage("E-mail inválido");

        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("Token é obrigatório");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("Nova senha é obrigatória")
            .MinimumLength(8).WithMessage("Nova senha deve ter pelo menos 8 caracteres");
    }
}
