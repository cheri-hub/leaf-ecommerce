using System.Text;
using System.Globalization;

namespace EcommerceApi.Services;

public static class SlugHelper
{
    public static string GenerateSlug(string text)
    {
        var normalized = text.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();

        foreach (var c in normalized)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(c);
            if (category != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }

        var result = sb.ToString().Normalize(NormalizationForm.FormC);

        return string.Join('-', result
            .ToLowerInvariant()
            .Split([' ', '_', '.', ',', '/', '\\', '!', '?', '#', '&'], StringSplitOptions.RemoveEmptyEntries))
            .Trim('-');
    }
}
