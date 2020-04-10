# Activate and configure extensions
# https://middlemanapp.com/advanced/configuration/#configuring-extensions

activate :autoprefixer do |prefix|
  prefix.browsers = "last 2 versions"
end

activate :livereload
activate :i18n, :mount_at_root => :de

activate :blog do |blog|
  blog.sources = "blog/posts/{year}-{month}-{day}/{lang}.html"
  blog.permalink = "{lang}/blog/posts/{year}/{month}/{day}/{title}.html"
  blog.default_extension = 'html'
  blog.layout = 'blog_layout'
  blog.paginate = true
end

# Layouts
# https://middlemanapp.com/basics/layouts/

# Per-page layout changes
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

# With alternative layout
# page '/path/to/file.html', layout: 'other_layout'

# Proxy pages
# https://middlemanapp.com/advanced/dynamic-pages/

# proxy(
#   '/this-page-has-no-template.html',
#   '/template-file.html',
#   locals: {
#     which_fake_page: 'Rendering a fake page with a local variable'
#   },
# )

# Helpers
# Methods defined in the helpers block are available in templates
# https://middlemanapp.com/basics/helper-methods/

helpers do
  def curPageWithLang(newlang)
    if newlang == "de"
      newlang = ""
    else
      newlang = "/" + newlang
    end

    # blog posts use localized names, so i don't know how to augment the current URL with a new language...
    # for now we'll just send them back to the blog homepage
    if current_resource.url.include? "blog/posts"
      return newlang + "/blog"
    end

    return newlang + current_resource.url.sub("index.html", "").sub(I18n.locale.to_s + "/", "")
  end
end

# Build-specific configuration
# https://middlemanapp.com/advanced/configuration/#environment-specific-settings

configure :build do
  activate :minify_css
  activate :minify_javascript
  activate :minify_html
end

ready do
  proxy "_redirects", "netlify-redirects", ignore: true
end

Time.zone = "Europe/Zurich"
